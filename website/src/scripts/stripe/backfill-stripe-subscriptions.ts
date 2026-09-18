/**
 * Create-only backfill of missing Stripe subscriptions.
 * Dry-run by default (exit 1 if anything would be created). Pass `--apply` to write.
 *
 * Usage (from website/):
 *   DATABASE_URL=... STRIPE_SECRET_KEY=sk_live_... npm run db:backfill:stripe-subscriptions
 *   DATABASE_URL=... STRIPE_SECRET_KEY=sk_live_... npm run db:backfill:stripe-subscriptions -- --limit=10 --apply
 */

import { SubscriptionPaymentMethod } from '@/generated/prisma/client';
import { prisma } from '@/lib/database/prisma';
import { mapCoverTransactionCostsMetadata } from '@/lib/services/subscription/cover-transaction-costs';
import {
	mapStripeSubscriptionLifecycle,
	mapStripeSubscriptionPriceFields,
	resolveStripeResourceId,
	shouldSkipStripeSubscriptionStatus,
} from '@/lib/services/subscription/subscription.mappers';
import Stripe from 'stripe';
import {
	assertDatabaseUrl,
	exitCodeForSummary,
	getDatabaseHost,
	log,
	mapWithConcurrency,
	parseBackfillCliOptions,
	printSummary,
} from '../shared/backfill-shared';

type Summary = {
	subscriptionsSeen: number;
	subscriptionsCreated: number;
	alreadyExists: number;
	skippedIncomplete: number;
	skippedNoCustomer: number;
	skippedNoContributor: number;
	skippedNoPrice: number;
	skippedUnknownStatus: number;
	errors: number;
};

type ProcessContext = {
	apply: boolean;
	fallbackCampaignId: string;
	contributorByStripeCustomerId: Map<string, string>;
	campaignExistsCache: Map<string, boolean>;
	summary: Summary;
};

const createSummary = (): Summary => ({
	subscriptionsSeen: 0,
	subscriptionsCreated: 0,
	alreadyExists: 0,
	skippedIncomplete: 0,
	skippedNoCustomer: 0,
	skippedNoContributor: 0,
	skippedNoPrice: 0,
	skippedUnknownStatus: 0,
	errors: 0,
});

const getStripeClient = (): Stripe => {
	const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
	if (!stripeSecretKey?.startsWith('sk_')) {
		throw new Error('Missing or invalid STRIPE_SECRET_KEY (expected sk_...)');
	}

	return new Stripe(stripeSecretKey, { typescript: true });
};

const stripeKeyMode = (secretKey: string): 'live' | 'test' | 'unknown' => {
	if (secretKey.startsWith('sk_live_')) {
		return 'live';
	}
	if (secretKey.startsWith('sk_test_')) {
		return 'test';
	}

	return 'unknown';
};

const printBanner = (options: { apply: boolean; limit: number | null; concurrency: number }) => {
	const dbHost = getDatabaseHost(process.env.DATABASE_URL ?? '');

	log('=== Stripe subscription backfill ===');
	log(`Mode: ${options.apply ? 'APPLY (writes enabled)' : 'DRY-RUN (no writes)'}`);
	log(`Stripe key mode: ${stripeKeyMode(process.env.STRIPE_SECRET_KEY ?? '')}`);
	log(`Database host: ${dbHost}`);
	log(`Limit: ${options.limit ?? 'none'} (Stripe list order, typically newest first)`);
	log(`Concurrency: ${options.concurrency}`);
	log('');
};

const getFallbackCampaignId = async (): Promise<string> => {
	const fallback = await prisma.campaign.findFirst({
		where: { isFallback: true },
		select: { id: true },
	});
	if (!fallback) {
		throw new Error('No fallback campaign found (isFallback=true)');
	}

	return fallback.id;
};

const loadContributorByStripeCustomerId = async (): Promise<Map<string, string>> => {
	const contributors = await prisma.contributor.findMany({
		where: { stripeCustomerId: { not: null } },
		select: { id: true, stripeCustomerId: true },
	});

	const map = new Map<string, string>();
	for (const contributor of contributors) {
		if (contributor.stripeCustomerId) {
			map.set(contributor.stripeCustomerId, contributor.id);
		}
	}

	return map;
};

const campaignExists = async (campaignId: string, cache: Map<string, boolean>): Promise<boolean> => {
	const cached = cache.get(campaignId);
	if (cached !== undefined) {
		return cached;
	}

	const campaign = await prisma.campaign.findUnique({
		where: { id: campaignId },
		select: { id: true },
	});
	const exists = Boolean(campaign);
	cache.set(campaignId, exists);

	return exists;
};

const resolveCampaignId = async (
	metadataCampaignId: string | undefined,
	fallbackCampaignId: string,
	cache: Map<string, boolean>,
): Promise<string> => {
	if (metadataCampaignId && (await campaignExists(metadataCampaignId, cache))) {
		return metadataCampaignId;
	}

	return fallbackCampaignId;
};

const listAllSubscriptions = async (stripe: Stripe, limit: number | null): Promise<Stripe.Subscription[]> => {
	const subscriptions: Stripe.Subscription[] = [];
	let startingAfter: string | undefined;

	while (true) {
		const page = await stripe.subscriptions.list({
			status: 'all',
			limit: 100,
			expand: ['data.items.data.price'],
			...(startingAfter ? { starting_after: startingAfter } : {}),
		});

		for (const subscription of page.data) {
			subscriptions.push(subscription);
			if (limit !== null && subscriptions.length >= limit) {
				return subscriptions;
			}
		}

		if (!page.has_more || page.data.length === 0) {
			break;
		}

		startingAfter = page.data[page.data.length - 1]?.id;
	}

	return subscriptions;
};

const processSubscription = async (context: ProcessContext, subscription: Stripe.Subscription) => {
	const { apply, fallbackCampaignId, contributorByStripeCustomerId, campaignExistsCache, summary } = context;
	summary.subscriptionsSeen += 1;

	const existing = await prisma.subscription.findUnique({
		where: { stripeSubscriptionId: subscription.id },
		select: { id: true },
	});
	if (existing) {
		summary.alreadyExists += 1;

		return;
	}

	if (shouldSkipStripeSubscriptionStatus(subscription.status)) {
		summary.skippedIncomplete += 1;
		log(`skip incomplete ${subscription.id} (${subscription.status})`);

		return;
	}

	const lifecycle = mapStripeSubscriptionLifecycle(subscription);
	if (!lifecycle) {
		summary.skippedUnknownStatus += 1;
		log(`skip unknown status ${subscription.id} (${subscription.status})`);

		return;
	}

	const customerId = resolveStripeResourceId(subscription.customer);
	if (!customerId) {
		summary.skippedNoCustomer += 1;
		log(`skip no customer ${subscription.id}`);

		return;
	}

	const contributorId = contributorByStripeCustomerId.get(customerId);
	if (!contributorId) {
		summary.skippedNoContributor += 1;
		log(`skip no contributor for customer ${customerId} (${subscription.id})`);

		return;
	}

	const priceFields = mapStripeSubscriptionPriceFields(subscription);
	if (!priceFields) {
		summary.skippedNoPrice += 1;
		log(`skip unmapped price ${subscription.id}`);

		return;
	}

	const campaignId = await resolveCampaignId(subscription.metadata?.campaignId, fallbackCampaignId, campaignExistsCache);

	if (apply) {
		await prisma.subscription.create({
			data: {
				stripeSubscriptionId: subscription.id,
				contributorId,
				campaignId,
				amount: priceFields.amount,
				currency: priceFields.currency,
				interval: priceFields.interval,
				status: lifecycle.status,
				paymentMethod: SubscriptionPaymentMethod.stripe,
				canceledAt: lifecycle.canceledAt,
				coverTransactionCosts: mapCoverTransactionCostsMetadata(subscription.metadata),
			},
		});
	}

	summary.subscriptionsCreated += 1;
	log(
		`${apply ? 'wrote' : 'would write'} ${subscription.id} → contributor=${contributorId} status=${lifecycle.status} interval=${priceFields.interval} amount=${priceFields.amount} ${priceFields.currency} campaign=${campaignId}`,
	);
};

const main = async () => {
	assertDatabaseUrl();
	const { apply, limit, concurrency } = parseBackfillCliOptions(process.argv.slice(2));
	printBanner({ apply, limit, concurrency });

	const stripe = getStripeClient();
	const [fallbackCampaignId, contributorByStripeCustomerId] = await Promise.all([
		getFallbackCampaignId(),
		loadContributorByStripeCustomerId(),
	]);
	log(`Loaded ${contributorByStripeCustomerId.size} contributors with stripeCustomerId`);

	const summary = createSummary();
	const subscriptions = await listAllSubscriptions(stripe, limit);
	log(`Loaded ${subscriptions.length} Stripe subscriptions`);
	log('');

	const context: ProcessContext = {
		apply,
		fallbackCampaignId,
		contributorByStripeCustomerId,
		campaignExistsCache: new Map(),
		summary,
	};

	await mapWithConcurrency(subscriptions, concurrency, async (subscription) => {
		try {
			await processSubscription(context, subscription);
		} catch (error) {
			summary.errors += 1;
			log(`error processing ${subscription.id}: ${error instanceof Error ? error.message : String(error)}`);
		}
	});

	printSummary(summary);
	process.exitCode = exitCodeForSummary(summary, apply);
};

main()
	.catch((error) => {
		console.error(error);
		process.exitCode = 1;
	})
	.finally(async () => {
		await prisma.$disconnect();
	});

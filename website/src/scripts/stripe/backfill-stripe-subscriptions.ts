/**
 * One-off backfill: Stripe subscriptions → DB Subscription rows.
 *
 * Dry-run by default. Writes only with `--apply`.
 *
 * Usage (from website/):
 *   DATABASE_URL=... STRIPE_SECRET_KEY=sk_live_... npx tsx src/scripts/stripe/backfill-stripe-subscriptions.ts
 *   DATABASE_URL=... STRIPE_SECRET_KEY=sk_live_... npx tsx src/scripts/stripe/backfill-stripe-subscriptions.ts --limit=10
 *   DATABASE_URL=... STRIPE_SECRET_KEY=sk_live_... npx tsx src/scripts/stripe/backfill-stripe-subscriptions.ts --concurrency=2 --apply
 *   DATABASE_URL=... STRIPE_SECRET_KEY=sk_live_... npx tsx src/scripts/stripe/backfill-stripe-subscriptions.ts --apply
 */

import { Currency, DonationInterval, SubscriptionPaymentMethod, SubscriptionStatus } from '@/generated/prisma/client';
import { prisma } from '@/lib/database/prisma';
import { isValidCurrency } from '@/lib/types/currency';
import Stripe from 'stripe';
import { assertDatabaseUrl, exitCodeForSummary, getDatabaseHost, log, printSummary } from '../shared/backfill-shared';
import {
	getStripeKeyMode,
	mapStripePriceAmount,
	mapStripeRecurringInterval,
	mapStripeSubscriptionStatus,
	mapWithConcurrency,
	parseBackfillCliOptions,
	resolveStripeCustomerId,
	shouldSkipStripeSubscriptionStatus,
} from './backfill-stripe-subscriptions.mappers';

type Summary = {
	subscriptionsSeen: number;
	subscriptionsCreated: number;
	subscriptionsUpdated: number;
	skippedIncomplete: number;
	skippedNoContributor: number;
	skippedUnsupportedInterval: number;
	skippedUnsupportedCurrency: number;
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
	subscriptionsUpdated: 0,
	skippedIncomplete: 0,
	skippedNoContributor: 0,
	skippedUnsupportedInterval: 0,
	skippedUnsupportedCurrency: 0,
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

const assertEnv = () => {
	assertDatabaseUrl();
	if (!process.env.STRIPE_SECRET_KEY) {
		throw new Error('Missing STRIPE_SECRET_KEY');
	}
};

const printBanner = (options: { apply: boolean; limit: number | null; concurrency: number }) => {
	const keyMode = getStripeKeyMode(process.env.STRIPE_SECRET_KEY ?? '');
	const dbHost = getDatabaseHost(process.env.DATABASE_URL ?? '');

	log('=== Stripe subscription backfill ===');
	log(`Mode: ${options.apply ? 'APPLY (writes enabled)' : 'DRY-RUN (no writes)'}`);
	log(`Stripe key mode: ${keyMode}`);
	log(`Database host: ${dbHost}`);
	log(`Limit: ${options.limit ?? 'none'}`);
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

const extractPrice = (subscription: Stripe.Subscription) => {
	const item = subscription.items.data[0];
	const price = item?.price;
	if (!price?.recurring) {
		return null;
	}

	return {
		unitAmount: price.unit_amount,
		currency: price.currency,
		interval: price.recurring.interval,
		intervalCount: price.recurring.interval_count,
	};
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

const upsertSubscription = async (input: {
	apply: boolean;
	stripeSubscriptionId: string;
	contributorId: string;
	campaignId: string;
	amount: number;
	currency: Currency;
	interval: DonationInterval;
	status: SubscriptionStatus;
	canceledAt: Date | null;
}): Promise<'created' | 'updated'> => {
	const existing = await prisma.subscription.findUnique({
		where: { stripeSubscriptionId: input.stripeSubscriptionId },
		select: { id: true },
	});

	if (!input.apply) {
		return existing ? 'updated' : 'created';
	}

	const sharedFields = {
		contributorId: input.contributorId,
		campaignId: input.campaignId,
		amount: input.amount,
		currency: input.currency,
		interval: input.interval,
		status: input.status,
		paymentMethod: SubscriptionPaymentMethod.stripe,
		canceledAt: input.canceledAt,
	};

	await prisma.subscription.upsert({
		where: { stripeSubscriptionId: input.stripeSubscriptionId },
		create: {
			stripeSubscriptionId: input.stripeSubscriptionId,
			...sharedFields,
		},
		update: sharedFields,
	});

	return existing ? 'updated' : 'created';
};

const processSubscription = async (context: ProcessContext, subscription: Stripe.Subscription) => {
	const { apply, fallbackCampaignId, contributorByStripeCustomerId, campaignExistsCache, summary } = context;
	summary.subscriptionsSeen += 1;

	if (shouldSkipStripeSubscriptionStatus(subscription.status)) {
		summary.skippedIncomplete += 1;
		log(`skip incomplete ${subscription.id} (${subscription.status})`);

		return;
	}

	const mappedStatus = mapStripeSubscriptionStatus(subscription.status, subscription.ended_at);
	if (!mappedStatus) {
		summary.skippedUnknownStatus += 1;
		log(`skip unknown status ${subscription.id} (${subscription.status})`);

		return;
	}

	const customerId = resolveStripeCustomerId(subscription.customer);
	if (!customerId) {
		summary.skippedNoContributor += 1;
		log(`skip no customer ${subscription.id}`);

		return;
	}

	const contributorId = contributorByStripeCustomerId.get(customerId);
	if (!contributorId) {
		summary.skippedNoContributor += 1;
		log(`skip no contributor for customer ${customerId} (${subscription.id})`);

		return;
	}

	const price = extractPrice(subscription);
	if (!price) {
		summary.skippedNoPrice += 1;
		log(`skip no price ${subscription.id}`);

		return;
	}

	const interval = mapStripeRecurringInterval(price.interval, price.intervalCount);
	if (!interval) {
		summary.skippedUnsupportedInterval += 1;
		log(`skip unsupported interval ${subscription.id} (${price.interval}/${price.intervalCount})`);

		return;
	}

	const amount = mapStripePriceAmount(price.unitAmount);
	if (amount === null) {
		summary.skippedNoPrice += 1;
		log(`skip invalid amount ${subscription.id}`);

		return;
	}

	const currencyCode = price.currency.toUpperCase();
	if (!isValidCurrency(currencyCode)) {
		summary.skippedUnsupportedCurrency += 1;
		log(`skip unsupported currency ${subscription.id} (${currencyCode})`);

		return;
	}

	const campaignId = await resolveCampaignId(subscription.metadata?.campaignId, fallbackCampaignId, campaignExistsCache);
	const canceledAt = subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null;

	const outcome = await upsertSubscription({
		apply,
		stripeSubscriptionId: subscription.id,
		contributorId,
		campaignId,
		amount,
		currency: currencyCode,
		interval,
		status: mappedStatus,
		canceledAt,
	});

	if (outcome === 'created') {
		summary.subscriptionsCreated += 1;
	} else {
		summary.subscriptionsUpdated += 1;
	}

	log(
		`${apply ? 'wrote' : 'would write'} ${subscription.id} → contributor=${contributorId} status=${mappedStatus} interval=${interval} amount=${amount} ${currencyCode} campaign=${campaignId}`,
	);
};

const main = async () => {
	assertEnv();
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
	process.exitCode = exitCodeForSummary(summary);
};

main()
	.catch((error) => {
		console.error(error);
		process.exitCode = 1;
	})
	.finally(async () => {
		await prisma.$disconnect();
	});

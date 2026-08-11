/**
 * One-off backfill: Stripe subscriptions → DB Subscription rows + contribution links.
 *
 * Dry-run by default. Writes only with --apply.
 * One run does both: upsert subscriptions and link contributions.
 * Non-local --apply requires --confirm-apply or CONFIRM_APPLY=1.
 * Dry-run conflict detection only works for subscriptions that already exist in DB.
 *
 * Usage (from website/):
 *   DATABASE_URL=... STRIPE_SECRET_KEY=sk_live_... npx tsx src/lib/database/scripts/backfill-stripe-subscriptions.ts
 *   DATABASE_URL=... STRIPE_SECRET_KEY=sk_live_... npx tsx src/lib/database/scripts/backfill-stripe-subscriptions.ts --limit=10
 *   DATABASE_URL=... STRIPE_SECRET_KEY=sk_live_... npx tsx src/lib/database/scripts/backfill-stripe-subscriptions.ts --concurrency=2 --apply
 *   DATABASE_URL=... STRIPE_SECRET_KEY=sk_live_... npx tsx src/lib/database/scripts/backfill-stripe-subscriptions.ts --apply --confirm-apply
 */

import {
	Currency,
	DonationInterval,
	PaymentEventType,
	SubscriptionPaymentMethod,
	SubscriptionStatus,
} from '@/generated/prisma/client';
import { isValidCurrency } from '@/lib/types/currency';
import Stripe from 'stripe';
import { prisma } from '../prisma';
import { assertApplyAllowed, exitCodeForSummary, getDatabaseHost } from './backfill-shared';
import {
	getStripeKeyMode,
	mapStripePriceAmount,
	mapStripeRecurringInterval,
	mapStripeSubscriptionStatus,
	mapWithConcurrency,
	parseBackfillCliOptions,
	resolveStripeChargeId,
	resolveStripeCustomerId,
	shouldSkipStripeSubscriptionStatus,
} from './backfill-stripe-subscriptions.mappers';

type Summary = {
	subscriptionsSeen: number;
	subscriptionsCreated: number;
	subscriptionsUpdated: number;
	contributionsLinked: number;
	skippedIncomplete: number;
	skippedNoContributor: number;
	skippedUnsupportedInterval: number;
	skippedUnsupportedCurrency: number;
	skippedNoPrice: number;
	skippedUnknownStatus: number;
	linkConflicts: number;
	errors: number;
};

type ProcessContext = {
	stripe: Stripe;
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
	contributionsLinked: 0,
	skippedIncomplete: 0,
	skippedNoContributor: 0,
	skippedUnsupportedInterval: 0,
	skippedUnsupportedCurrency: 0,
	skippedNoPrice: 0,
	skippedUnknownStatus: 0,
	linkConflicts: 0,
	errors: 0,
});

const log = (message: string) => console.info(message);

const getStripeClient = (): Stripe => {
	const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
	if (!stripeSecretKey?.startsWith('sk_')) {
		throw new Error('Missing or invalid STRIPE_SECRET_KEY (expected sk_...)');
	}

	return new Stripe(stripeSecretKey, { typescript: true });
};

const assertEnv = () => {
	if (!process.env.DATABASE_URL) {
		throw new Error('Missing DATABASE_URL');
	}
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

const listChargeIdsForSubscription = async (stripe: Stripe, subscriptionId: string): Promise<string[]> => {
	const chargeIds: string[] = [];
	const paymentIntentIdsToResolve: string[] = [];
	let startingAfter: string | undefined;

	while (true) {
		// Stripe allows at most 4 expand levels; keep this at data.payments.data.payment.
		const page = await stripe.invoices.list({
			subscription: subscriptionId,
			limit: 100,
			expand: ['data.payments.data.payment'],
			...(startingAfter ? { starting_after: startingAfter } : {}),
		});

		for (const invoice of page.data) {
			const payments = invoice.payments?.data ?? [];
			for (const invoicePayment of payments) {
				if (invoicePayment.status !== 'paid') {
					continue;
				}

				const payment = invoicePayment.payment;
				const directChargeId = resolveStripeChargeId(payment.charge);
				if (directChargeId) {
					chargeIds.push(directChargeId);
					continue;
				}

				const paymentIntentRef = payment.payment_intent;
				if (!paymentIntentRef) {
					continue;
				}

				paymentIntentIdsToResolve.push(typeof paymentIntentRef === 'string' ? paymentIntentRef : paymentIntentRef.id);
			}
		}

		if (!page.has_more || page.data.length === 0) {
			break;
		}

		startingAfter = page.data[page.data.length - 1]?.id;
	}

	const uniquePaymentIntentIds = [...new Set(paymentIntentIdsToResolve)];
	await mapWithConcurrency(uniquePaymentIntentIds, 2, async (paymentIntentId) => {
		const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
		const latestChargeId = resolveStripeChargeId(paymentIntent.latest_charge);
		if (latestChargeId) {
			chargeIds.push(latestChargeId);
		}
	});

	return [...new Set(chargeIds)];
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
}): Promise<{ outcome: 'created' | 'updated'; id: string | null }> => {
	const existing = await prisma.subscription.findUnique({
		where: { stripeSubscriptionId: input.stripeSubscriptionId },
		select: { id: true },
	});

	if (!input.apply) {
		return { outcome: existing ? 'updated' : 'created', id: existing?.id ?? null };
	}

	const upserted = await prisma.subscription.upsert({
		where: { stripeSubscriptionId: input.stripeSubscriptionId },
		create: {
			stripeSubscriptionId: input.stripeSubscriptionId,
			contributorId: input.contributorId,
			campaignId: input.campaignId,
			amount: input.amount,
			currency: input.currency,
			interval: input.interval,
			status: input.status,
			paymentMethod: SubscriptionPaymentMethod.stripe,
			canceledAt: input.canceledAt,
		},
		update: {
			contributorId: input.contributorId,
			campaignId: input.campaignId,
			amount: input.amount,
			currency: input.currency,
			interval: input.interval,
			status: input.status,
			canceledAt: input.canceledAt,
			paymentMethod: SubscriptionPaymentMethod.stripe,
		},
		select: { id: true },
	});

	return { outcome: existing ? 'updated' : 'created', id: upserted.id };
};

const linkContributions = async (input: {
	apply: boolean;
	subscriptionId: string | null;
	chargeIds: string[];
	summary: Summary;
}): Promise<{ linkedContributionCampaignId: string | null }> => {
	let linkedContributionCampaignId: string | null = null;

	if (input.chargeIds.length === 0) {
		return { linkedContributionCampaignId };
	}

	const paymentEvents = await prisma.paymentEvent.findMany({
		where: {
			type: PaymentEventType.stripe,
			transactionId: { in: input.chargeIds },
		},
		select: {
			id: true,
			transactionId: true,
			contribution: {
				select: {
					id: true,
					campaignId: true,
					subscriptionId: true,
					createdAt: true,
				},
			},
		},
		orderBy: { contribution: { createdAt: 'asc' } },
	});

	for (const paymentEvent of paymentEvents) {
		const contribution = paymentEvent.contribution;
		linkedContributionCampaignId ??= contribution.campaignId;

		if (contribution.subscriptionId) {
			if (input.subscriptionId && contribution.subscriptionId !== input.subscriptionId) {
				input.summary.linkConflicts += 1;
				log(
					`  conflict: contribution ${contribution.id} already linked to ${contribution.subscriptionId} (wanted ${input.subscriptionId}, charge ${paymentEvent.transactionId})`,
				);
			}
			continue;
		}

		if (input.apply) {
			if (!input.subscriptionId) {
				continue;
			}
			await prisma.contribution.update({
				where: { id: contribution.id },
				data: { subscriptionId: input.subscriptionId },
			});
		}

		input.summary.contributionsLinked += 1;
	}

	return { linkedContributionCampaignId };
};

const processSubscription = async (context: ProcessContext, subscription: Stripe.Subscription) => {
	const { stripe, apply, fallbackCampaignId, contributorByStripeCustomerId, campaignExistsCache, summary } = context;
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

	const metadataCampaignId = subscription.metadata?.campaignId;
	let campaignId = await resolveCampaignId(metadataCampaignId, fallbackCampaignId, campaignExistsCache);
	const canceledAt = subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null;

	const upsertResult = await upsertSubscription({
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

	if (upsertResult.outcome === 'created') {
		summary.subscriptionsCreated += 1;
	} else {
		summary.subscriptionsUpdated += 1;
	}

	const chargeIds = await listChargeIdsForSubscription(stripe, subscription.id);
	const { linkedContributionCampaignId } = await linkContributions({
		apply,
		subscriptionId: upsertResult.id,
		chargeIds,
		summary,
	});

	if (
		apply &&
		upsertResult.id &&
		(!metadataCampaignId || !(await campaignExists(metadataCampaignId, campaignExistsCache))) &&
		linkedContributionCampaignId &&
		linkedContributionCampaignId !== campaignId
	) {
		await prisma.subscription.update({
			where: { id: upsertResult.id },
			data: { campaignId: linkedContributionCampaignId },
		});
		campaignId = linkedContributionCampaignId;
	}

	log(
		`${apply ? 'wrote' : 'would write'} ${subscription.id} → contributor=${contributorId} status=${mappedStatus} interval=${interval} amount=${amount} ${currencyCode} campaign=${campaignId} charges=${chargeIds.length}`,
	);
};

const printSummary = (summary: Summary) => {
	log('');
	log('=== Summary ===');
	for (const [key, value] of Object.entries(summary)) {
		log(`${key}: ${value}`);
	}
};

const main = async () => {
	assertEnv();
	const { apply, confirmApply, limit, concurrency } = parseBackfillCliOptions(process.argv.slice(2));
	assertApplyAllowed({
		apply,
		databaseUrl: process.env.DATABASE_URL ?? '',
		confirmApply,
	});
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
		stripe,
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

/**
 * One-off backfill: bank_transfer standing orders → DB Subscription rows.
 *
 * Heuristic:
 * 1. Group bank_transfer PaymentEvents by standing-order reference
 *    (transactionId `1234567890` or `1234567890-{millis}`)
 * 2. Keep groups with ≥2 succeeded contributions
 * 3. If median gap between payments is ~20–45 days → treat as monthly standing order
 * 4. Upsert Subscription (paymentMethod=bank_transfer, interval=monthly, bankStandingOrderReference=ref)
 *
 * Dry-run by default. Writes only with `--apply`.
 * `--limit` takes groups in first-seen reference order (not largest-first).
 *
 * Usage (from website/):
 *   DATABASE_URL=... npx tsx src/lib/database/scripts/backfill-bank-subscriptions.ts
 *   DATABASE_URL=... npx tsx src/lib/database/scripts/backfill-bank-subscriptions.ts --limit=20
 *   DATABASE_URL=... npx tsx src/lib/database/scripts/backfill-bank-subscriptions.ts --apply
 */

import {
	ContributionStatus,
	Currency,
	DonationInterval,
	PaymentEventType,
	SubscriptionPaymentMethod,
	SubscriptionStatus,
} from '@/generated/prisma/client';
import { prisma } from '../prisma';
import {
	daysBetween,
	extractStandingOrderReference,
	inferSubscriptionStatus,
	looksLikeMonthlyStandingOrder,
	modeAmount,
	modeValue,
	parseBankBackfillCliOptions,
} from './backfill-bank-subscriptions.mappers';
import { assertDatabaseUrl, exitCodeForSummary, getDatabaseHost, log, printSummary } from './backfill-shared';

type Summary = {
	paymentEventsSeen: number;
	groupsSeen: number;
	subscriptionsCreated: number;
	subscriptionsUpdated: number;
	skippedNoReference: number;
	skippedTooFewPayments: number;
	skippedNotMonthly: number;
	skippedMixedContributor: number;
	skippedMixedCurrency: number;
	errors: number;
};

type BankPaymentRow = {
	transactionId: string;
	contributorId: string;
	campaignId: string;
	amount: number;
	currency: Currency;
	status: ContributionStatus;
	createdAt: Date;
};

type StandingOrderGroup = {
	standingOrderReference: string;
	payments: BankPaymentRow[];
};

const createSummary = (): Summary => ({
	paymentEventsSeen: 0,
	groupsSeen: 0,
	subscriptionsCreated: 0,
	subscriptionsUpdated: 0,
	skippedNoReference: 0,
	skippedTooFewPayments: 0,
	skippedNotMonthly: 0,
	skippedMixedContributor: 0,
	skippedMixedCurrency: 0,
	errors: 0,
});

const printBanner = (apply: boolean, limit: number | null) => {
	const dbHost = getDatabaseHost(process.env.DATABASE_URL ?? '');

	log('=== Bank subscription backfill ===');
	log(`Mode: ${apply ? 'APPLY (writes enabled)' : 'DRY-RUN (no writes)'}`);
	log(`Database host: ${dbHost}`);
	log(`Limit (groups, first-seen order): ${limit ?? 'none'}`);
	log('');
};

const loadBankPayments = async (): Promise<BankPaymentRow[]> => {
	const paymentEvents = await prisma.paymentEvent.findMany({
		where: { type: PaymentEventType.bank_transfer },
		select: {
			transactionId: true,
			contribution: {
				select: {
					contributorId: true,
					campaignId: true,
					amount: true,
					currency: true,
					status: true,
					createdAt: true,
				},
			},
		},
		orderBy: { createdAt: 'asc' },
	});

	return paymentEvents.map((paymentEvent) => ({
		transactionId: paymentEvent.transactionId,
		contributorId: paymentEvent.contribution.contributorId,
		campaignId: paymentEvent.contribution.campaignId,
		amount: Number(paymentEvent.contribution.amount),
		currency: paymentEvent.contribution.currency,
		status: paymentEvent.contribution.status,
		createdAt: paymentEvent.contribution.createdAt,
	}));
};

const groupByStandingOrderReference = (payments: BankPaymentRow[], summary: Summary): StandingOrderGroup[] => {
	const groups = new Map<string, BankPaymentRow[]>();

	for (const payment of payments) {
		summary.paymentEventsSeen += 1;
		const standingOrderReference = extractStandingOrderReference(payment.transactionId);
		if (!standingOrderReference) {
			summary.skippedNoReference += 1;
			continue;
		}

		const existing = groups.get(standingOrderReference) ?? [];
		existing.push(payment);
		groups.set(standingOrderReference, existing);
	}

	return [...groups.entries()].map(([standingOrderReference, groupPayments]) => ({
		standingOrderReference,
		payments: groupPayments,
	}));
};

const processGroup = async (input: { group: StandingOrderGroup; apply: boolean; summary: Summary }) => {
	const { group, apply, summary } = input;
	summary.groupsSeen += 1;

	const succeeded = group.payments.filter((payment) => payment.status === ContributionStatus.succeeded);
	if (succeeded.length < 2) {
		summary.skippedTooFewPayments += 1;
		log(
			`skip too few succeeded payments ref=${group.standingOrderReference} succeeded=${succeeded.length} total=${group.payments.length}`,
		);

		return;
	}

	const contributorIds = new Set(succeeded.map((payment) => payment.contributorId));
	if (contributorIds.size !== 1) {
		summary.skippedMixedContributor += 1;
		log(`skip mixed contributors ref=${group.standingOrderReference}`);

		return;
	}
	const contributorId = succeeded[0].contributorId;

	const currencies = new Set(succeeded.map((payment) => payment.currency));
	if (currencies.size !== 1) {
		summary.skippedMixedCurrency += 1;
		log(`skip mixed currencies ref=${group.standingOrderReference}`);

		return;
	}
	const currency = succeeded[0].currency;

	const gapsInDays: number[] = [];
	for (let index = 1; index < succeeded.length; index += 1) {
		gapsInDays.push(daysBetween(succeeded[index - 1].createdAt, succeeded[index].createdAt));
	}

	if (!looksLikeMonthlyStandingOrder(gapsInDays)) {
		summary.skippedNotMonthly += 1;
		log(`skip not monthly ref=${group.standingOrderReference} gaps=${gapsInDays.map((gap) => gap.toFixed(1)).join(',')}`);

		return;
	}

	const amount = modeAmount(succeeded.map((payment) => payment.amount));
	const campaignId = modeValue(succeeded.map((payment) => payment.campaignId));
	const lastPaymentAt = succeeded[succeeded.length - 1].createdAt;
	const status = inferSubscriptionStatus(lastPaymentAt);
	const canceledAt = status === SubscriptionStatus.active ? null : lastPaymentAt;

	const existing = await prisma.subscription.findUnique({
		where: { bankStandingOrderReference: group.standingOrderReference },
		select: { id: true },
	});

	if (apply) {
		const sharedFields = {
			contributorId,
			campaignId,
			amount,
			currency,
			interval: DonationInterval.monthly,
			status,
			paymentMethod: SubscriptionPaymentMethod.bank_transfer,
			canceledAt,
		};

		await prisma.subscription.upsert({
			where: { bankStandingOrderReference: group.standingOrderReference },
			create: {
				bankStandingOrderReference: group.standingOrderReference,
				...sharedFields,
			},
			update: sharedFields,
		});
	}

	if (existing) {
		summary.subscriptionsUpdated += 1;
	} else {
		summary.subscriptionsCreated += 1;
	}

	log(
		`${apply ? 'wrote' : 'would write'} ref=${group.standingOrderReference} → contributor=${contributorId} status=${status} interval=${DonationInterval.monthly} amount=${amount} ${currency} payments=${succeeded.length} campaign=${campaignId}`,
	);
};

const main = async () => {
	assertDatabaseUrl();
	const { apply, limit } = parseBankBackfillCliOptions(process.argv.slice(2));
	printBanner(apply, limit);

	const summary = createSummary();
	const payments = await loadBankPayments();
	log(`Loaded ${payments.length} bank_transfer payment events`);

	let groups = groupByStandingOrderReference(payments, summary);
	log(`Grouped into ${groups.length} standing-order references`);

	if (limit !== null) {
		groups = groups.slice(0, limit);
		log(`Processing first ${groups.length} groups (--limit)`);
	}
	log('');

	for (const group of groups) {
		try {
			await processGroup({ group, apply, summary });
		} catch (error) {
			summary.errors += 1;
			log(`error processing ref=${group.standingOrderReference}: ${error instanceof Error ? error.message : String(error)}`);
		}
	}

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

/**
 * Create-only backfill of missing bank standing-order subscriptions.
 *
 * Groups bank_transfer payments by contributor + amount + currency.
 * Creates a monthly subscription when there are ≥2 succeeded payments with a ~20–45 day median gap.
 *
 * Dry-run by default (exit 1 if anything would be created). Pass `--apply` to write.
 * `--limit` takes groups in first-seen order.
 *
 * Usage (from website/):
 *   DATABASE_URL=... npm run db:backfill:bank-subscriptions
 *   DATABASE_URL=... npm run db:backfill:bank-subscriptions -- --limit=20 --apply
 */

import {
	ContributionStatus,
	Currency,
	DonationInterval,
	PaymentEventType,
	SubscriptionPaymentMethod,
	SubscriptionStatus,
} from '@/generated/prisma/client';
import { prisma } from '@/lib/database/prisma';
import {
	assertDatabaseUrl,
	exitCodeForSummary,
	getDatabaseHost,
	log,
	parseBackfillCliOptions,
	printSummary,
} from '../shared/backfill-shared';
import {
	daysBetween,
	disambiguateStandingOrderReference,
	inferSubscriptionStatus,
	looksLikeMonthlyStandingOrder,
	modeValue,
	preferredStandingOrderReference,
	uniquifyStandingOrderReferences,
} from './backfill-bank-subscriptions.mappers';

type Summary = {
	paymentEventsSeen: number;
	groupsSeen: number;
	subscriptionsCreated: number;
	alreadyExists: number;
	skippedTooFewPayments: number;
	skippedNotMonthly: number;
	errors: number;
};

type BankPaymentRow = {
	transactionId: string;
	contributorId: string;
	paymentReferenceId: string | null;
	campaignId: string;
	amount: number;
	currency: Currency;
	status: ContributionStatus;
	createdAt: Date;
};

type ContributorAmountGroup = {
	contributorId: string;
	amount: number;
	currency: Currency;
	standingOrderReference: string;
	payments: BankPaymentRow[];
};

const createSummary = (): Summary => ({
	paymentEventsSeen: 0,
	groupsSeen: 0,
	subscriptionsCreated: 0,
	alreadyExists: 0,
	skippedTooFewPayments: 0,
	skippedNotMonthly: 0,
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
					contributor: { select: { paymentReferenceId: true } },
				},
			},
		},
		orderBy: { createdAt: 'asc' },
	});

	return paymentEvents.map((paymentEvent) => ({
		transactionId: paymentEvent.transactionId,
		contributorId: paymentEvent.contribution.contributorId,
		paymentReferenceId: paymentEvent.contribution.contributor.paymentReferenceId,
		campaignId: paymentEvent.contribution.campaignId,
		amount: Number(paymentEvent.contribution.amount),
		currency: paymentEvent.contribution.currency,
		status: paymentEvent.contribution.status,
		createdAt: paymentEvent.contribution.createdAt,
	}));
};

const groupByContributorAmount = (payments: BankPaymentRow[], summary: Summary): ContributorAmountGroup[] => {
	const groups = new Map<string, BankPaymentRow[]>();

	for (const payment of payments) {
		summary.paymentEventsSeen += 1;
		const key = `${payment.contributorId}|${payment.amount}|${payment.currency}`;
		const existing = groups.get(key) ?? [];
		existing.push(payment);
		groups.set(key, existing);
	}

	return [...groups.values()].map((groupPayments) => {
		const { contributorId, amount, currency, paymentReferenceId } = groupPayments[0];

		return {
			contributorId,
			amount,
			currency,
			standingOrderReference: preferredStandingOrderReference({
				transactionIds: groupPayments.map((payment) => payment.transactionId),
				paymentReferenceId,
				contributorId,
				amount,
				currency,
			}),
			payments: groupPayments,
		};
	});
};

const succeededPayments = (payments: BankPaymentRow[]): BankPaymentRow[] =>
	payments
		.filter((payment) => payment.status === ContributionStatus.succeeded)
		.sort((left, right) => left.createdAt.getTime() - right.createdAt.getTime());

const evaluateGroup = (group: ContributorAmountGroup, summary: Summary): BankPaymentRow[] | null => {
	summary.groupsSeen += 1;

	const succeeded = succeededPayments(group.payments);
	if (succeeded.length < 2) {
		summary.skippedTooFewPayments += 1;
		log(
			`skip too few succeeded payments contributor=${group.contributorId} amount=${group.amount} ${group.currency} succeeded=${succeeded.length} total=${group.payments.length}`,
		);

		return null;
	}

	const gapsInDays = succeeded.slice(1).map((payment, index) => daysBetween(succeeded[index].createdAt, payment.createdAt));

	if (!looksLikeMonthlyStandingOrder(gapsInDays)) {
		summary.skippedNotMonthly += 1;
		log(
			`skip not monthly contributor=${group.contributorId} amount=${group.amount} ${group.currency} gaps=${gapsInDays.map((gap) => gap.toFixed(1)).join(',')}`,
		);

		return null;
	}

	return succeeded;
};

const writeGroup = async (input: {
	group: ContributorAmountGroup;
	succeeded: BankPaymentRow[];
	apply: boolean;
	summary: Summary;
}) => {
	const { group, succeeded, apply, summary } = input;

	const existing = await prisma.subscription.findFirst({
		where: {
			contributorId: group.contributorId,
			amount: group.amount,
			currency: group.currency,
			paymentMethod: SubscriptionPaymentMethod.bank_transfer,
		},
		select: { id: true },
	});
	if (existing) {
		summary.alreadyExists += 1;

		return;
	}

	let standingOrderReference = group.standingOrderReference;
	const existingByReference = await prisma.subscription.findUnique({
		where: { bankStandingOrderReference: standingOrderReference },
		select: { id: true },
	});
	if (existingByReference) {
		standingOrderReference = disambiguateStandingOrderReference(standingOrderReference, group.contributorId, group.amount);
	}

	const campaignId = modeValue(succeeded.map((payment) => payment.campaignId));
	const lastPaymentAt = succeeded[succeeded.length - 1].createdAt;
	const status = inferSubscriptionStatus(lastPaymentAt);
	const canceledAt = status === SubscriptionStatus.active ? null : lastPaymentAt;

	if (apply) {
		await prisma.subscription.create({
			data: {
				bankStandingOrderReference: standingOrderReference,
				contributorId: group.contributorId,
				campaignId,
				amount: group.amount,
				currency: group.currency,
				interval: DonationInterval.monthly,
				status,
				paymentMethod: SubscriptionPaymentMethod.bank_transfer,
				canceledAt,
			},
		});
	}

	summary.subscriptionsCreated += 1;
	log(
		`${apply ? 'wrote' : 'would write'} ref=${standingOrderReference} → contributor=${group.contributorId} status=${status} interval=${DonationInterval.monthly} amount=${group.amount} ${group.currency} payments=${succeeded.length} campaign=${campaignId}`,
	);
};

const main = async () => {
	assertDatabaseUrl();
	const { apply, limit } = parseBackfillCliOptions(process.argv.slice(2));
	printBanner(apply, limit);

	const summary = createSummary();
	const payments = await loadBankPayments();
	log(`Loaded ${payments.length} bank_transfer payment events`);

	let groups = groupByContributorAmount(payments, summary);
	log(`Grouped into ${groups.length} contributor+amount series`);

	if (limit !== null) {
		groups = groups.slice(0, limit);
		log(`Processing first ${groups.length} groups (--limit)`);
	}
	log('');

	const eligible: { group: ContributorAmountGroup; succeeded: BankPaymentRow[] }[] = [];
	for (const group of groups) {
		const succeeded = evaluateGroup(group, summary);
		if (succeeded) {
			eligible.push({ group, succeeded });
		}
	}

	const uniqueReferences = uniquifyStandingOrderReferences(
		eligible.map(({ group }) => ({
			reference: group.standingOrderReference,
			contributorId: group.contributorId,
			amount: group.amount,
		})),
	);

	for (const [index, { group, succeeded }] of eligible.entries()) {
		try {
			await writeGroup({
				group: { ...group, standingOrderReference: uniqueReferences[index] },
				succeeded,
				apply,
				summary,
			});
		} catch (error) {
			summary.errors += 1;
			log(
				`error processing contributor=${group.contributorId} amount=${group.amount} ${group.currency}: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}

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

import {
	type Currency,
	type SubscriptionCancellationReason,
	type SubscriptionPaymentMethod,
	type SubscriptionStatus,
} from '@/generated/prisma/enums';
import { type ContributorContributionSummary } from '@/modules/contributions/contribution.types';

export const SUBSCRIPTION_PAYMENT_METHOD_LABELS: Record<SubscriptionPaymentMethod, string> = {
	stripe: 'Stripe',
	bank_transfer: 'Bank transfer',
};

export const SUBSCRIPTION_STATUS_LABELS: Record<SubscriptionStatus, string> = {
	active: 'Active',
	ended: 'Ended',
};

export const SUBSCRIPTION_CANCELLATION_REASON_LABELS: Record<SubscriptionCancellationReason, string> = {
	financial_situation_changed: 'Financial situation changed',
	different_cause: 'Different cause',
	not_enough_updates: 'Not enough updates',
	technical_issue: 'Technical issue',
	prefer_one_time: 'Prefer one-time',
	pausing: 'Pausing',
	other: 'Other',
};

export const SUBSCRIPTION_AMOUNT_MIN = 1;
export const SUBSCRIPTION_AMOUNT_MAX = 1_000_000;
export const SUBSCRIPTION_AMOUNT_SLIDER_MAX = 5000;

export const COVER_TRANSACTION_COSTS_METADATA_KEY = 'coverTransactionCosts';

export const SUBSCRIPTION_CANCEL_REASONS = [
	'financial_situation_changed',
	'different_cause',
	'not_enough_updates',
	'technical_issue',
	'prefer_one_time',
	'pausing',
	'other',
] as const satisfies readonly SubscriptionCancellationReason[];

export const UPCOMING_PAYMENTS_PER_SUBSCRIPTION = 4;

export type BankTransferQrBillView = {
	contributorReferenceId: string;
	contributionReferenceId: string;
};

export type OwnedBankTransferQrBill = BankTransferQrBillView & {
	amount: number;
	currency: Currency;
};

type SubscriptionPaymentDisplay =
	{ type: 'bank_transfer'; qrBill: BankTransferQrBillView | null } | { type: 'stripe'; brand?: string; last4?: string };

export type ActiveSubscriptionView = {
	id: string;
	amount: number;
	currency: Currency;
	createdAt: Date;
	coverTransactionCosts: boolean;
	paymentDisplay: SubscriptionPaymentDisplay;
};

export type MonthlyContributionSummary = {
	totalAmount: number | null;
	currency: Currency | null;
	activeCount: number;
};

export type UpcomingPaymentView = {
	subscriptionId: string;
	scheduledAt: Date;
	amount: number;
	currency: Currency;
	paymentDisplay: SubscriptionPaymentDisplay;
	status: 'scheduled';
};

export type SubscriptionsDashboardView = {
	activeSubscriptions: ActiveSubscriptionView[];
	upcomingPayments: UpcomingPaymentView[];
	monthlyContribution: MonthlyContributionSummary;
	contributionSummary: ContributorContributionSummary;
};

export type SubscriptionTableViewRow = {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	amount: number;
	currency: Currency;
	status: SubscriptionStatus;
	cancellationReason: SubscriptionCancellationReason | null;
	paymentMethod: SubscriptionPaymentMethod;
	stripeSubscriptionId: string | null;
	bankStandingOrderReference: string | null;
	createdAt: Date;
};

export type SubscriptionTableQuery = {
	page: number;
	pageSize: number;
	search: string;
	sortBy?: string;
	sortDirection?: 'asc' | 'desc';
	subscriptionStatus?: string;
	subscriptionPaymentMethod?: string;
};

export type SubscriptionPaginatedTableView = {
	tableRows: SubscriptionTableViewRow[];
	totalCount: number;
};

export type SubscriptionUpsertResult = {
	id: string;
	stripeSubscriptionId: string | null;
	bankStandingOrderReference: string | null;
	campaignId: string;
	status: SubscriptionStatus;
};

export type UpsertBankStandingOrderInput = {
	bankStandingOrderReference: string;
	contributorId: string;
	campaignId: string;
	amount: number;
	currency: Currency;
	status?: SubscriptionStatus;
	canceledAt?: Date | null;
};

export const clampSubscriptionAmount = (value: number): number =>
	Math.min(SUBSCRIPTION_AMOUNT_MAX, Math.max(SUBSCRIPTION_AMOUNT_MIN, Math.round(value)));

export const parseSubscriptionAmountInput = (raw: string): number | null => {
	const trimmed = raw.trim();
	if (trimmed === '') {
		return null;
	}

	const parsed = Number(trimmed);
	if (!Number.isFinite(parsed)) {
		return null;
	}

	return clampSubscriptionAmount(parsed);
};

export const isSubscriptionAmountInRange = (amount: number): boolean =>
	Number.isInteger(amount) && amount >= SUBSCRIPTION_AMOUNT_MIN && amount <= SUBSCRIPTION_AMOUNT_MAX;

export const canUpdateSubscriptionAmount = (amount: number, initialAmount: number): boolean =>
	isSubscriptionAmountInRange(amount) && amount !== initialAmount;

const ONLINE_TRANSACTION_FEE_RATE = 0.03;

const roundAmount = (amount: number): number => Math.round(amount * 100) / 100;

export const getOnlineTransactionCost = (baseAmount: number): number => {
	if (baseAmount <= 0) {
		return 0;
	}

	return roundAmount(baseAmount * ONLINE_TRANSACTION_FEE_RATE);
};

export const getAmountWithTransactionCostCoverage = (baseAmount: number): number =>
	roundAmount(baseAmount + getOnlineTransactionCost(baseAmount));

export const getBaseAmountBeforeTransactionCostCoverage = (coveredAmount: number): number =>
	Math.round(coveredAmount / (1 + ONLINE_TRANSACTION_FEE_RATE));

export const mapCoverTransactionCostsMetadata = (metadata: Record<string, string> | null | undefined): boolean =>
	metadata?.[COVER_TRANSACTION_COSTS_METADATA_KEY] === 'true';

export const toCoverTransactionCostsMetadataValue = (coverTransactionCosts: boolean): string =>
	coverTransactionCosts ? 'true' : 'false';

export const isCoverTransactionCostsAmountInRange = (amount: number): boolean =>
	Number.isFinite(amount) && amount >= SUBSCRIPTION_AMOUNT_MIN && amount <= SUBSCRIPTION_AMOUNT_MAX;

export const amountToStripeUnitAmount = (amount: number): number => Math.round(amount * 100);

const SUBSCRIPTION_CANCEL_RETENTION_PRESETS = [15, 10, 5] as const;

export const getSubscriptionCancelRetentionPresets = (currentAmount: number): number[] =>
	SUBSCRIPTION_CANCEL_RETENTION_PRESETS.filter((preset) => preset < currentAmount);

export const isSubscriptionCancellationReason = (value: string): value is SubscriptionCancellationReason =>
	SUBSCRIPTION_CANCEL_REASONS.some((reason) => reason === value);

export const mapCancellationReasonToStripeFeedback = (
	reason: SubscriptionCancellationReason,
): 'too_expensive' | 'switched_service' | 'missing_features' | 'unused' | 'other' => {
	switch (reason) {
		case 'financial_situation_changed':
			return 'too_expensive';
		case 'different_cause':
			return 'switched_service';
		case 'not_enough_updates':
			return 'missing_features';
		case 'pausing':
			return 'unused';
		case 'technical_issue':
		case 'prefer_one_time':
		case 'other':
			return 'other';
	}
};

const startOfUtcDay = (date: Date): Date => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

const dateAtAnchorDay = (reference: Date, anchorDay: number, monthOffset: number): Date => {
	const year = reference.getUTCFullYear();
	const month = reference.getUTCMonth() + monthOffset;
	const lastDayOfTargetMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

	return new Date(Date.UTC(year, month, Math.min(anchorDay, lastDayOfTargetMonth)));
};

export const buildMonthlySchedule = ({
	anchor,
	count,
	now: referenceNow,
}: {
	anchor: Date;
	count: number;
	now: Date;
}): Date[] => {
	const anchorDay = anchor.getUTCDate();
	const today = startOfUtcDay(referenceNow);
	let monthOffset = 0;
	let first = dateAtAnchorDay(anchor, anchorDay, monthOffset);

	while (first.getTime() < today.getTime()) {
		monthOffset += 1;
		first = dateAtAnchorDay(anchor, anchorDay, monthOffset);
	}

	return Array.from({ length: count }, (_, index) => dateAtAnchorDay(anchor, anchorDay, monthOffset + index));
};

export const mergeUpcomingPayments = (payments: UpcomingPaymentView[]): UpcomingPaymentView[] => {
	return [...payments].sort((left, right) => {
		const dateDiff = left.scheduledAt.getTime() - right.scheduledAt.getTime();
		if (dateDiff !== 0) {
			return dateDiff;
		}

		return left.subscriptionId.localeCompare(right.subscriptionId);
	});
};

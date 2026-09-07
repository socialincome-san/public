import {
	type Currency,
	type SubscriptionCancellationReason,
	type SubscriptionPaymentMethod,
	type SubscriptionStatus,
} from '@/generated/prisma/client';
import { type ContributorContributionSummary } from '../contribution/contribution.types';

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

export type BankTransferQrBillView = {
	contributorReferenceId: string;
	contributionReferenceId: string;
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

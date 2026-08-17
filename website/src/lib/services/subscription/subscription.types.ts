import { type Currency, type SubscriptionPaymentMethod, type SubscriptionStatus } from '@/generated/prisma/client';
import { type ContributorContributionSummary } from '../contribution/contribution.types';

export const SUBSCRIPTION_PAYMENT_METHOD_LABELS: Record<SubscriptionPaymentMethod, string> = {
	stripe: 'Stripe',
	bank_transfer: 'Bank transfer',
};

export const SUBSCRIPTION_STATUS_LABELS: Record<SubscriptionStatus, string> = {
	active: 'Active',
	canceled: 'Canceled',
	ended: 'Ended',
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
	campaignId: string;
	campaignTitle: string;
	programName: string | null;
	status: SubscriptionStatus;
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
	programId?: string;
	campaignId?: string;
	subscriptionStatus?: string;
	subscriptionPaymentMethod?: string;
};

export type SubscriptionFilterOptions = {
	programs: { value: string; label: string }[];
	campaigns: { value: string; label: string }[];
	statuses: { value: string; label: string }[];
	paymentMethods: { value: string; label: string }[];
};

export type SubscriptionPaginatedTableView = {
	tableRows: SubscriptionTableViewRow[];
	totalCount: number;
	filterOptions: SubscriptionFilterOptions;
};

export const EMPTY_SUBSCRIPTION_FILTER_OPTIONS: SubscriptionFilterOptions = {
	programs: [],
	campaigns: [],
	statuses: [],
	paymentMethods: [],
};

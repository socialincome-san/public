import { type Currency } from '@/generated/prisma/client';
import { type ContributorContributionSummary } from '../contribution/contribution.types';

type SubscriptionPaymentDisplay = { type: 'bank_transfer' } | { type: 'stripe'; brand?: string; last4?: string };

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

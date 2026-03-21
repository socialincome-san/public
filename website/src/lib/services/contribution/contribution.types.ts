import { ContributionStatus, Currency, PaymentEventType, Prisma, ProgramPermission } from '@/generated/prisma/client';

export type ContributionTableViewRow = {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	amount: number;
	currency: Currency;
	campaignId: string;
	campaignTitle: string;
	paymentEventType: PaymentEventType | null;
	programName: string | null;
	createdAt: Date;
	permission: ProgramPermission;
};

export type ContributionTableQuery = {
	page: number;
	pageSize: number;
	search: string;
	sortBy?: string;
	sortDirection?: 'asc' | 'desc';
	programId?: string;
	campaignId?: string;
	paymentEventType?: string;
};

export type ContributionPaginatedTableView = {
	tableRows: ContributionTableViewRow[];
	totalCount: number;
	permission: ProgramPermission;
	filterOptions: {
		programs: { value: string; label: string }[];
		campaigns: { value: string; label: string }[];
		paymentEventTypes: { value: string; label: string }[];
	};
};

export type ContributionPayload = {
	id: string;
	amount: number;
	currency: Currency;
	amountChf: number;
	feesChf: number;
	status: ContributionStatus;
	contributor: {
		id: string;
	};
	campaign: {
		id: string;
	};
};

export type ContributionDonationEntry = {
	contributorId: string;
	amount: number;
	currency: Currency;
	amountChf: number;
	feesChf: number;
	status: ContributionStatus;
	createdAt: Date;
};

export type StripeContributionCreateData = {
	contributorId: string;
	amount: number;
	currency: Currency;
	amountChf: number;
	feesChf: number;
	status: ContributionStatus;
	campaignId: string;
	createdAt: Date;
};

export type PaymentEventCreateData = {
	type: PaymentEventType;
	transactionId: string;
	metadata?: Record<string, unknown>;
};

export type PaymentEventCreateInput = Prisma.PaymentEventCreateInput;

export type YourContributionsTableViewRow = {
	createdAt: Date;
	amount: number;
	currency: Currency;
	campaignTitle: string;
};

export type YourContributionsTableQuery = {
	page: number;
	pageSize: number;
	search: string;
	sortBy?: string;
	sortDirection?: 'asc' | 'desc';
};

export type YourContributionsPaginatedTableView = {
	tableRows: YourContributionsTableViewRow[];
	totalCount: number;
};

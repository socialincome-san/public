import type { ContributionStatus, CountryCode, Currency, PaymentEventType } from '@/generated/prisma/enums';

export type ContributionDateRange = {
	gte: Date;
	lt: Date;
};

export type ContributionSummary = {
	amountChf: number;
	count: number;
};

export type ContributionCountryRow = {
	countryCode: CountryCode;
	totalChf: number;
	contributorCount: number;
};

export type GlobeContribution = {
	key: string;
	amount: number;
	currency: string;
	contributedAt: string;
	countryCode: string;
	countryName: string;
};

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

export type BankTransferUpsertInput = {
	type: PaymentEventType;
	transactionId: string;
	metadata?: Record<string, unknown>;
	contribution: {
		amount: number;
		currency: Currency;
		amountChf: number;
		feesChf: number;
		status: ContributionStatus;
		campaignId: string;
		contributorId: string;
	};
};

export type PaymentEventRecord = {
	id: string;
	type: PaymentEventType;
	transactionId: string;
	contributionId: string;
	createdAt: Date;
	updatedAt: Date | null;
};

export type ContributionRecord = {
	id: string;
	amount: number;
	currency: Currency;
	amountChf: number;
	feesChf: number;
	status: ContributionStatus;
	contributorId: string;
	campaignId: string;
	createdAt: Date;
	updatedAt: Date | null;
};

export type YourContributionsTableViewRow = {
	createdAt: Date;
	updatedAt: Date | null;
	amount: number;
	currency: Currency;
	paymentEventType: PaymentEventType | null;
	campaignTitle: string;
	status: ContributionStatus;
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

export type ContributorContributionSummary = {
	totalAmountChf: number;
	count: number;
	firstContributionAt: Date | null;
};

export type ContributionFormOptions = {
	contributorOptions: { id: string; name: string }[];
	campaignOptions: { id: string; name: string }[];
};

import type { PayoutProcess } from '@/generated/prisma/enums';

export type MobileMoneyProviderTableViewRow = {
	id: string;
	name: string;
	parentName: string | null;
	payoutProcess: PayoutProcess | null;
	payoutProcessLabel: string | null;
	createdAt: Date;
};

export type MobileMoneyProviderTableQuery = {
	page: number;
	pageSize: number;
	search: string;
	sortBy?: string;
	sortDirection?: 'asc' | 'desc';
};

export type MobileMoneyProviderPaginatedTableView = {
	tableRows: MobileMoneyProviderTableViewRow[];
	totalCount: number;
};

export type MobileMoneyProviderPayload = {
	id: string;
	name: string;
	payoutProcess: PayoutProcess | null;
	parentId: string | null;
	createdAt: Date;
	updatedAt: Date | null;
};

export type MobileMoneyProviderOption = {
	id: string;
	name: string;
};

type MobileMoneyProviderPayoutProcessOption = {
	kind: 'mobile_money_provider';
	id: string;
	name: string;
	payoutProcess: PayoutProcess;
};

type TelecelCsvPayoutProcessOption = {
	kind: 'telecel_csv';
	id: 'telecel_csv';
	name: string;
	payoutProcess: 'telecel_csv';
	providerNames: string[];
};

export type PayoutProcessOverviewOption = MobileMoneyProviderPayoutProcessOption | TelecelCsvPayoutProcessOption;

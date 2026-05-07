export type MobileMoneyProviderTableViewRow = {
	id: string;
	name: string;
	parentName: string | null;
	isSupported: boolean;
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
	isSupported: boolean;
	parentId: string | null;
	createdAt: Date;
	updatedAt: Date | null;
};

export type MobileMoneyProviderOption = {
	id: string;
	name: string;
};

export type MobileMoneyProviderTableViewRow = {
	id: string;
	name: string;
	isSupported: boolean;
	createdAt: Date;
};

export type MobileMoneyProviderTableView = {
	tableRows: MobileMoneyProviderTableViewRow[];
};

export type MobileMoneyProviderPayload = {
	id: string;
	name: string;
	isSupported: boolean;
	createdAt: Date;
	updatedAt: Date | null;
};

export type MobileMoneyProviderCreateInput = {
	name: string;
	isSupported: boolean;
};

export type MobileMoneyProviderUpdateInput = {
	id: string;
	name?: string;
	isSupported?: boolean;
};

export type MobileMoneyProviderOption = {
	id: string;
	name: string;
};

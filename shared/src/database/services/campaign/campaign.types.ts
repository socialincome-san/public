import { OrganizationPermission } from '@prisma/client';

export type CampaignTableViewRow = {
	id: string;
	title: string;
	description: string;
	currency: string;
	endDate: Date;
	isActive: boolean;
	programName: string | null;
	createdAt: Date;
	permission: OrganizationPermission;
};

export type CampaignTableView = {
	tableRows: CampaignTableViewRow[];
};

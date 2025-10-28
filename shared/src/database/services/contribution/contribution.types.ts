import { OrganizationPermission } from '@prisma/client';

export type ContributionTableViewRow = {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	amount: number;
	currency: string;
	campaignTitle: string;
	programName: string | null;
	createdAt: Date;
	permission: OrganizationPermission;
};

export type ContributionTableView = {
	tableRows: ContributionTableViewRow[];
};

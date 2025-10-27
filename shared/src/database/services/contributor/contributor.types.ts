import { OrganizationPermission } from '@prisma/client';

export type ContributorTableViewRow = {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	country: string | null;
	createdAt: Date;
	permission: OrganizationPermission;
};

export type ContributorTableView = {
	tableRows: ContributorTableViewRow[];
};

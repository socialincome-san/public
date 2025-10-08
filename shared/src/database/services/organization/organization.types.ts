import { Organization } from '@prisma/client';

export type CreateOrganizationInput = Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>;

export type OrganizationTableViewRow = {
	id: string;
	name: string;
	ownedProgramsCount: number;
	operatedProgramsCount: number;
	usersCount: number;
};

export type OrganizationTableView = {
	tableRows: OrganizationTableViewRow[];
};

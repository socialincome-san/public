import { Organization as PrismaOrganization } from '@prisma/client';

export type CreateOrganizationInput = Omit<PrismaOrganization, 'id' | 'createdAt' | 'updatedAt'>;

export type OrganizationTableViewRow = {
	id: string;
	name: string;
	operatedProgramsCount: number;
	viewedProgramsCount: number;
	usersCount: number;
	readonly: boolean;
};

export type OrganizationTableView = {
	tableRows: OrganizationTableViewRow[];
};

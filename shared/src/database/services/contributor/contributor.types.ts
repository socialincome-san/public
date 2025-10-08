import { Contributor, ProgramPermission } from '@prisma/client';

export type CreateContributorInput = Omit<Contributor, 'id' | 'createdAt' | 'updatedAt'>;

export type ContributorTableViewRow = {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	country: string | null;
	currency: string | null;
	programName: string;
	createdAt: Date;
	createdAtFormatted: string;
	permission: ProgramPermission;
};

export type ContributorTableView = {
	tableRows: ContributorTableViewRow[];
};

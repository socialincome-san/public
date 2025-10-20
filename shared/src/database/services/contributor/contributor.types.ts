import { ProgramPermission } from '@prisma/client';

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

import { Contribution, ContributionStatus, Prisma, ProgramPermission } from '@prisma/client';

export type CreateContributionInput = Omit<Contribution, 'id' | 'createdAt' | 'updatedAt'> & {
	amount?: Prisma.Decimal;
};

export type ContributionTableViewRow = {
	id: string;
	contributorName: string;
	amount: number;
	currency: string;
	status: ContributionStatus;
	campaignName: string;
	programName: string;
	createdAt: Date;
	createdAtFormatted: string;
	permission: ProgramPermission;
};

export type ContributionTableView = {
	tableRows: ContributionTableViewRow[];
};

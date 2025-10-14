import { ContributionStatus, ProgramPermission } from '@prisma/client';

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

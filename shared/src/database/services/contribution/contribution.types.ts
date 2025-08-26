import {
	ContributionInterval,
	ContributionSource,
	ContributionStatus,
	Contribution as PrismaContribution,
} from '@prisma/client';

export type CreateContributionInput = Omit<PrismaContribution, 'id' | 'createdAt' | 'updatedAt'>;

export type ProgramPermission = 'operator' | 'viewer';

export type ContributionTableViewRow = {
	id: string;
	source: ContributionSource;
	createdAt: Date;
	createdAtFormatted: string;
	amount: number;
	currency: string;
	status: ContributionStatus;
	campaignName: string;
	programName: string;
	contributionInterval: ContributionInterval;
	permission: ProgramPermission;
};

export type ContributionTableView = {
	tableRows: ContributionTableViewRow[];
};

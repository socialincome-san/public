import { ProgramPermission } from '@prisma/client';

export type CampaignTableViewRow = {
	id: string;
	title: string;
	creatorName: string;
	creatorEmail: string;
	status: boolean;
	goal: number | null;
	currency: string | null;
	endDate: Date;
	endDateFormatted: string;
	programName: string;
	programId: string;
	permission: ProgramPermission;
};

export type CampaignTableView = {
	tableRows: CampaignTableViewRow[];
};

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
	programName: string | null;
};

export type CampaignTableView = {
	tableRows: CampaignTableViewRow[];
};

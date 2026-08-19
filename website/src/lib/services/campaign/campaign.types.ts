import { Currency } from '@/generated/prisma/client';

export type CampaignTableViewRow = {
	id: string;
	link: string;
	slug: string;
	title: string;
	currency: Currency;
	endDate: Date;
	isActive: boolean;
	programName: string | null;
	createdAt: Date;
};

export type CampaignTableEntry = Omit<CampaignTableViewRow, 'link' | 'title'> & {
	programPortalSlug: string | null;
};

export type CampaignTableQuery = {
	page: number;
	pageSize: number;
	search: string;
	sortBy?: string;
	sortDirection?: 'asc' | 'desc';
};

export type CampaignPaginatedTableView = {
	tableRows: CampaignTableViewRow[];
	totalCount: number;
};

type CampaignPayload = {
	id: string;
	goal?: number | null;
	currency: Currency;
	additionalAmountChf?: number | null;
	endDate: Date;
	slug?: string | null;
	program: {
		id: string;
		name: string;
	} | null;
};

export type CampaignPage = CampaignPayload & {
	numberOfContributions: number;
	amountCollected: number | null;
	percentageCollected: number | null;
	daysLeft: number;
};

export type CampaignOption = { id: string; name: string };

export type PublicCampaignActivity = 'active' | 'inactive' | 'all';

type PublicCampaignCardImage = {
	filename: string;
	alt: string | null;
	focus: string | null;
};

export type PublicCampaignCard = {
	id: string;
	title: string;
	slug: string;
	creatorName: string | null;
	currency: Currency;
	endDate: Date;
	goal: number | null;
	isActive: boolean;
	primaryImage?: PublicCampaignCardImage | null;
};

export type CampaignCmsJoin = Omit<PublicCampaignCard, 'title' | 'creatorName' | 'primaryImage'>;

export type PublicCampaignStats = {
	contributionsCount: number;
	daysLeft: number;
	amountCollected: number | null;
	percentageCollected: number | null;
};

export type PublicCampaignStatsMap = Record<string, PublicCampaignStats>;

export type PublicCampaignsWithStats = {
	campaigns: PublicCampaignCard[];
	statsById: PublicCampaignStatsMap;
};

export type CampaignCmsJoinWithStats = {
	campaigns: CampaignCmsJoin[];
	statsById: PublicCampaignStatsMap;
};

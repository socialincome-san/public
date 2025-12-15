import { OrganizationPermission, Prisma } from '@prisma/client';

export type CampaignTableViewRow = {
	id: string;
	link: string;
	title: string;
	description: string;
	currency: string;
	endDate: Date;
	isActive: boolean;
	programName: string | null;
	createdAt: Date;
	permission: OrganizationPermission;
};

export type CampaignTableView = {
	tableRows: CampaignTableViewRow[];
};

export type CampaignPayload = {
	id: string;
	title: string;
	description: string;
	secondDescriptionTitle?: string | null;
	secondDescription?: string | null;
	thirdDescriptionTitle?: string | null;
	thirdDescription?: string | null;
	linkWebsite?: string | null;
	linkInstagram?: string | null;
	linkTiktok?: string | null;
	linkFacebook?: string | null;
	linkX?: string | null;
	goal?: number | null;
	currency: string;
	additionalAmountChf?: number | null;
	endDate: Date;
	isActive: boolean;
	public?: boolean | null;
	featured?: boolean | null;
	slug?: string | null;
	metadataDescription?: string | null;
	metadataOgImage?: string | null;
	metadataTwitterImage?: string | null;
	creatorName: string | null;
	creatorEmail: string | null;
	program: {
		id: string;
		name: string;
	} | null;
};

export type CampaignPage = CampaignPayload & {
	numberOfContributions: number;
	amountCollected: number;
	percentageCollected: number | null;
	daysLeft: number;
};

// campaign will be created using current users organization ID
export type CampaignsCreateInput = Omit<Prisma.CampaignCreateInput, 'organization'>;
export type CampaignsUpdateInput = Prisma.CampaignUpdateInput;
export type CampaignOption = { id: string; name: string };

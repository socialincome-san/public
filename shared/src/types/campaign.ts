import { Currency } from './currency';
import { Timestamp } from './timestamp';

export const CAMPAIGN_FIRESTORE_PATH = 'campaigns';

export type Campaign = {
	creator_name: string;
	email: string;
	title: string;
	description: string;
	second_description_title?: string;
	second_description?: string;
	third_description_title?: string;
	third_description?: string;
	link_website?: string;
	link_instagram?: string;
	link_tiktok?: string;
	link_facebook?: string;
	link_x?: string;
	goal?: number;
	goal_currency?: Currency;
	additional_amount_chf?: number;
	end_date: Timestamp;
	status: CampaignStatus;
	public?: boolean;
	featured?: boolean;
	slug?: string; // optional, for nicer url instead of firestore id
	metadata_description?: string;
	metadata_ogImage?: string;
	metadata_twitterImage?: string;
};

export enum CampaignStatus {
	Active = 'active',
	Inactive = 'inactive',
}

export type Link = {
	name: string;
	url: string;
};

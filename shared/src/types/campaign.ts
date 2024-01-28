import { Currency } from './currency';
import { Timestamp } from './timestamp';

export const CAMPAIGN_FIRESTORE_PATH = 'campaigns';

export type Campaign = {
	creator_name: string;
	email: string;
	title: string;
	description: string;
	amount_collected_chf: number; // automatically updated by incoming payments.
	contributions: number; // automatically updated by incoming payments.
	goal?: number;
	goal_currency?: Currency;
	end_date: Timestamp;
	status: CampaignStatus;
};

export enum CampaignStatus {
	Active = 'active',
	Inactive = 'inactive',
}

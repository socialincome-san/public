import { Currency } from './currency';
import { Timestamp } from './timestamp';

export const CAMPAIGN_FIRESTORE_PATH = 'campaigns';

export type Campaign = {
	email: string;
	title: string;
	description: string;
	amount_collected_chf: number; // automatically updated by incoming payments.
	goal?: number;
	goal_currency?: Currency;
	start_date: Timestamp;
	end_date: Timestamp;
	status: CampaignStatus;
};

export enum CampaignStatus {
	Active = 'active',
	Inactive = 'inactive',
}

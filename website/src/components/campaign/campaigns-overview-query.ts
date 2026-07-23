export const STATE_QUERY_KEY = 'state';

export type CampaignStateFilter = 'active' | 'inactive' | 'all';

export const DEFAULT_CAMPAIGN_STATE: CampaignStateFilter = 'active';

export const isCampaignStateFilter = (value: string): value is CampaignStateFilter => {
	return value === 'active' || value === 'inactive' || value === 'all';
};

import type { AnySearchParams } from '@/lib/types/page-props';
import {
	DEFAULT_CAMPAIGN_STATE,
	isCampaignStateFilter,
	STATE_QUERY_KEY,
	type CampaignStateFilter,
} from './campaigns-overview-query';

const getQueryValue = (searchParams: AnySearchParams | undefined, key: string) => {
	const value = searchParams?.[key];
	const firstValue = Array.isArray(value) ? value.at(0) : value;

	return typeof firstValue === 'string' ? firstValue.trim() : '';
};

export const getStateQuery = (searchParams?: AnySearchParams): CampaignStateFilter => {
	const value = getQueryValue(searchParams, STATE_QUERY_KEY);

	return isCampaignStateFilter(value) ? value : DEFAULT_CAMPAIGN_STATE;
};

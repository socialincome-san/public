'use client';

import { FilterDropdown } from '@/components/filters/filter-dropdown';
import { DEFAULT_CAMPAIGN_STATE, STATE_QUERY_KEY, type CampaignStateFilter } from './campaigns-overview-query';

type Props = {
	allLabel: string;
	activeLabel: string;
	inactiveLabel: string;
	selectedState: CampaignStateFilter;
};

export const CampaignsOverviewFilters = ({ allLabel, activeLabel, inactiveLabel, selectedState }: Props) => {
	return (
		<div className="flex min-h-10 flex-1 flex-wrap items-center gap-2">
			<FilterDropdown
				options={[
					{ value: 'all', label: allLabel },
					{ value: 'active', label: activeLabel },
					{ value: 'inactive', label: inactiveLabel },
				]}
				queryKey={STATE_QUERY_KEY}
				selectedValue={selectedState}
				clearValue={DEFAULT_CAMPAIGN_STATE}
			/>
		</div>
	);
};

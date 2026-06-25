import { FocusesOverviewDropdownFilter } from './focuses-overview-dropdown-filter';
import { SDG_QUERY_KEY } from './focuses-overview-query';
import type { FilterOption } from './focuses-overview.server';

type Props = {
	allSdgsLabel: string;
	sdgOptions: FilterOption[];
	selectedSdg?: string;
};

export const FocusesOverviewSdgFilter = ({ allSdgsLabel, sdgOptions, selectedSdg }: Props) => (
	<FocusesOverviewDropdownFilter
		allOptionsLabel={allSdgsLabel}
		options={sdgOptions}
		queryKey={SDG_QUERY_KEY}
		selectedValue={selectedSdg}
	/>
);

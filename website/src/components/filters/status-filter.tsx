import type { AnySearchParams } from '@/app/page-props';
import { getTranslations } from 'next-intl/server';
import { FilterDropdown } from './filter-dropdown';
import { type FilterQueryParamOverride, getQueryValue } from './filter-query';

const STATUS_QUERY_KEY = 'status';
const FILTER_STATUSES = ['active', 'concluded'] as const;
const ALL_STATUSES_QUERY = 'all';

export type FilterStatus = (typeof FILTER_STATUSES)[number];

// Without a status in the URL, the list shows defaultStatus; "all" lifts it
export const getStatusQuery = (searchParams?: AnySearchParams, defaultStatus?: FilterStatus): FilterStatus | undefined => {
	const value = getQueryValue(searchParams, STATUS_QUERY_KEY);

	return value === ALL_STATUSES_QUERY ? undefined : (FILTER_STATUSES.find((status) => status === value) ?? defaultStatus);
};

type StatusFilterProps = {
	/** Status of every item in the list; only statuses that occur become options */
	statuses: FilterStatus[];
	/** Must be one of the statuses */
	selectedStatus?: FilterStatus;
	/** The status shown without a status in the URL; must match getStatusQuery's defaultStatus */
	defaultStatus?: FilterStatus;
	queryParamOverrides?: FilterQueryParamOverride[];
};

export const StatusFilter = async ({ statuses, selectedStatus, defaultStatus, queryParamOverrides }: StatusFilterProps) => {
	const t = await getTranslations('website-common');
	const options = FILTER_STATUSES.filter((status) => statuses.includes(status)).map((status) => ({
		value: status,
		label: t(`status-filter.${status}`),
	}));

	const allLabel = t('status-filter.all', { count: options.length });

	if (!defaultStatus) {
		return (
			<FilterDropdown
				allLabel={allLabel}
				options={options}
				queryKey={STATUS_QUERY_KEY}
				selectedValue={selectedStatus}
				queryParamOverrides={queryParamOverrides}
			/>
		);
	}

	// With a default, an empty URL means the default status, so "all" needs a value of its own
	return options.length < 2 ? null : (
		<FilterDropdown
			options={[{ value: ALL_STATUSES_QUERY, label: allLabel }, ...options]}
			queryKey={STATUS_QUERY_KEY}
			selectedValue={selectedStatus ?? ALL_STATUSES_QUERY}
			clearValue={defaultStatus}
			queryParamOverrides={queryParamOverrides}
		/>
	);
};

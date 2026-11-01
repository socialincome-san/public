import type { AnySearchParams } from '@/app/page-props';
import { getTranslations } from 'next-intl/server';
import { FilterDropdown } from './filter-dropdown';
import { type FilterQueryParamOverride, getQueryValue } from './filter-query';

const STATUS_QUERY_KEY = 'status';
const FILTER_STATUSES = ['active', 'concluded'] as const;

export type FilterStatus = (typeof FILTER_STATUSES)[number];

export const getStatusQuery = (searchParams?: AnySearchParams): FilterStatus | undefined =>
	FILTER_STATUSES.find((status) => status === getQueryValue(searchParams, STATUS_QUERY_KEY));

type StatusFilterProps = {
	/** Status of every item in the list; only statuses that occur become options */
	statuses: FilterStatus[];
	/** Must be one of the statuses */
	selectedStatus?: FilterStatus;
	queryParamOverrides?: FilterQueryParamOverride[];
};

export const StatusFilter = async ({ statuses, selectedStatus, queryParamOverrides }: StatusFilterProps) => {
	const t = await getTranslations('website-common');
	const options = FILTER_STATUSES.filter((status) => statuses.includes(status)).map((status) => ({
		value: status,
		label: t(`status-filter.${status}`),
	}));

	return (
		<FilterDropdown
			allLabel={t('status-filter.all', { count: options.length })}
			options={options}
			queryKey={STATUS_QUERY_KEY}
			selectedValue={selectedStatus}
			queryParamOverrides={queryParamOverrides}
		/>
	);
};

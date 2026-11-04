import type { AnySearchParams } from '@/app/page-props';

export const SEARCH_QUERY_KEY = 'search';

export type FilterQueryParamOverride = {
	key: string;
	value?: string;
};

export const applyQueryParamOverrides = (params: URLSearchParams, overrides: FilterQueryParamOverride[] = []) => {
	overrides.forEach(({ key, value }) => {
		if (value) {
			params.set(key, value);
		} else {
			params.delete(key);
		}
	});
};

export const getQueryValue = (searchParams: AnySearchParams | undefined, key: string) => {
	const value = searchParams?.[key];
	const firstValue = Array.isArray(value) ? value.at(0) : value;

	return typeof firstValue === 'string' ? firstValue.trim() : '';
};

export const getSearchQuery = (searchParams?: AnySearchParams) => getQueryValue(searchParams, SEARCH_QUERY_KEY);

// The overview content types' "Show filter bar" option; on unless an editor switched it off. Read through the
// generated types' index signature until they are regenerated with the field.
export const showsFilterBar = (content: Record<string, unknown>) => content.showFilters !== false;

export const COUNTRY_QUERY_KEY = 'country';
export const FOCUS_QUERY_KEY = 'focus';
export const SEARCH_QUERY_KEY = 'search';

export type QueryParamOverride = {
	key: string;
	value?: string;
};

export const applyQueryParamOverrides = (params: URLSearchParams, overrides: QueryParamOverride[] = []) => {
	overrides.forEach(({ key, value }) => {
		if (value) {
			params.set(key, value);
		} else {
			params.delete(key);
		}
	});
};

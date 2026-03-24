export const IMPACT_FILTER_QUERY_KEYS = {
	country: 'country',
	program: 'program',
	questionnaire: 'questionnaire',
	recipientFilters: 'recipientFilters',
} as const;

export const FILTER_PREFIX = {
	country: 'country:',
	program: 'program:',
	questionnaire: 'questionnaire:',
	recipient: 'recipient:',
} as const;

export type ImpactFilterQueryParams = Partial<
	Record<(typeof IMPACT_FILTER_QUERY_KEYS)[keyof typeof IMPACT_FILTER_QUERY_KEYS], string>
>;

export const parseCsvParam = (value?: string): string[] =>
	(value ?? '')
		.split(',')
		.map((item) => item.trim())
		.filter(Boolean);

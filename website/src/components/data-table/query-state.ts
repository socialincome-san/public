export const TABLE_PAGE_SIZE_OPTIONS = [10, 50, 100, 1000] as const;
const MAX_SEARCH_LENGTH = 120;
const MAX_QUERY_TOKEN_LENGTH = 64;

const DEFAULT_TABLE_QUERY = {
	page: 1,
	pageSize: TABLE_PAGE_SIZE_OPTIONS[0],
	search: '',
} as const;

export type TableQueryState = {
	page: number;
	pageSize: number;
	search: string;
	sortBy?: string;
	sortDirection?: 'asc' | 'desc';
	programId?: string;
	localPartnerId?: string;
	country?: string;
	currency?: string;
	gender?: string;
	campaignId?: string;
	paymentEventType?: string;
	payoutStatus?: string;
	recipientStatus?: string;
};

type QueryValue = string | string[] | number | null | undefined;

type TableQueryInput = {
	page?: QueryValue;
	pageSize?: QueryValue;
	search?: QueryValue;
	sortBy?: QueryValue;
	sortDirection?: QueryValue;
	programId?: QueryValue;
	localPartnerId?: QueryValue;
	country?: QueryValue;
	currency?: QueryValue;
	gender?: QueryValue;
	campaignId?: QueryValue;
	paymentEventType?: QueryValue;
	payoutStatus?: QueryValue;
	recipientStatus?: QueryValue;
};

const takeFirst = (value: QueryValue): string | undefined => {
	if (Array.isArray(value)) {
		const first = value[0];

		return first === undefined ? undefined : String(first);
	}
	if (value === null || value === undefined) {
		return undefined;
	}

	return String(value);
};

const stripControlChars = (value: string): string =>
	Array.from(value)
		.filter((char) => {
			const code = char.charCodeAt(0);

			return !(code <= 31 || code === 127);
		})
		.join('');

const normalizeToken = (value: QueryValue, maxLength: number): string => {
	const token = takeFirst(value);
	if (!token) {
		return '';
	}

	return stripControlChars(token).trim().slice(0, maxLength);
};

const parsePositiveInt = (value: QueryValue, fallback: number) => {
	const parsed = Number(takeFirst(value));
	if (!Number.isInteger(parsed) || parsed < 1) {
		return fallback;
	}

	return parsed;
};

const normalizeTableQuery = (input: TableQueryInput): TableQueryState => {
	const page = parsePositiveInt(input.page, DEFAULT_TABLE_QUERY.page);
	const rawPageSize = parsePositiveInt(input.pageSize, DEFAULT_TABLE_QUERY.pageSize);
	const pageSize = TABLE_PAGE_SIZE_OPTIONS.includes(rawPageSize as (typeof TABLE_PAGE_SIZE_OPTIONS)[number])
		? rawPageSize
		: DEFAULT_TABLE_QUERY.pageSize;
	const search = normalizeToken(input.search, MAX_SEARCH_LENGTH) || DEFAULT_TABLE_QUERY.search;
	const sortBy = normalizeToken(input.sortBy, MAX_QUERY_TOKEN_LENGTH);
	const rawSortDirection = normalizeToken(input.sortDirection, MAX_QUERY_TOKEN_LENGTH).toLowerCase();
	const sortDirection = rawSortDirection === 'asc' || rawSortDirection === 'desc' ? rawSortDirection : undefined;
	const programId = normalizeToken(input.programId, MAX_QUERY_TOKEN_LENGTH);
	const localPartnerId = normalizeToken(input.localPartnerId, MAX_QUERY_TOKEN_LENGTH);
	const country = normalizeToken(input.country, MAX_QUERY_TOKEN_LENGTH);
	const currency = normalizeToken(input.currency, MAX_QUERY_TOKEN_LENGTH);
	const gender = normalizeToken(input.gender, MAX_QUERY_TOKEN_LENGTH);
	const campaignId = normalizeToken(input.campaignId, MAX_QUERY_TOKEN_LENGTH);
	const paymentEventType = normalizeToken(input.paymentEventType, MAX_QUERY_TOKEN_LENGTH);
	const payoutStatus = normalizeToken(input.payoutStatus, MAX_QUERY_TOKEN_LENGTH);
	const recipientStatus = normalizeToken(input.recipientStatus, MAX_QUERY_TOKEN_LENGTH);

	return {
		page,
		pageSize,
		search,
		sortBy: sortBy || undefined,
		sortDirection: sortBy ? sortDirection : undefined,
		programId: programId || undefined,
		localPartnerId: localPartnerId || undefined,
		country: country || undefined,
		currency: currency || undefined,
		gender: gender || undefined,
		campaignId: campaignId || undefined,
		paymentEventType: paymentEventType || undefined,
		payoutStatus: payoutStatus || undefined,
		recipientStatus: recipientStatus || undefined,
	};
};

export const tableQueryFromSearchParams = (searchParams: Record<string, string | string[] | undefined>): TableQueryState => {
	return normalizeTableQuery({
		page: searchParams.page,
		pageSize: searchParams.pageSize,
		search: searchParams.search,
		sortBy: searchParams.sortBy,
		sortDirection: searchParams.sortDirection,
		programId: searchParams.programId,
		localPartnerId: searchParams.localPartnerId,
		country: searchParams.country,
		currency: searchParams.currency,
		gender: searchParams.gender,
		campaignId: searchParams.campaignId,
		paymentEventType: searchParams.paymentEventType,
		payoutStatus: searchParams.payoutStatus,
		recipientStatus: searchParams.recipientStatus,
	});
};

export const applyTableQueryPatch = (
	currentSearchParams: URLSearchParams,
	patch: Partial<TableQueryState>,
): URLSearchParams => {
	const hasPatchKey = <K extends keyof TableQueryState>(key: K) => Object.prototype.hasOwnProperty.call(patch, key);

	const nextQuery = normalizeTableQuery({
		page: hasPatchKey('page') ? patch.page : currentSearchParams.get('page'),
		pageSize: hasPatchKey('pageSize') ? patch.pageSize : currentSearchParams.get('pageSize'),
		search: hasPatchKey('search') ? patch.search : currentSearchParams.get('search'),
		sortBy: hasPatchKey('sortBy') ? patch.sortBy : currentSearchParams.get('sortBy'),
		sortDirection: hasPatchKey('sortDirection') ? patch.sortDirection : currentSearchParams.get('sortDirection'),
		programId: hasPatchKey('programId') ? patch.programId : currentSearchParams.get('programId'),
		localPartnerId: hasPatchKey('localPartnerId') ? patch.localPartnerId : currentSearchParams.get('localPartnerId'),
		country: hasPatchKey('country') ? patch.country : currentSearchParams.get('country'),
		currency: hasPatchKey('currency') ? patch.currency : currentSearchParams.get('currency'),
		gender: hasPatchKey('gender') ? patch.gender : currentSearchParams.get('gender'),
		campaignId: hasPatchKey('campaignId') ? patch.campaignId : currentSearchParams.get('campaignId'),
		paymentEventType: hasPatchKey('paymentEventType') ? patch.paymentEventType : currentSearchParams.get('paymentEventType'),
		payoutStatus: hasPatchKey('payoutStatus') ? patch.payoutStatus : currentSearchParams.get('payoutStatus'),
		recipientStatus: hasPatchKey('recipientStatus') ? patch.recipientStatus : currentSearchParams.get('recipientStatus'),
	});

	const nextParams = new URLSearchParams(currentSearchParams.toString());
	nextParams.set('page', String(nextQuery.page));
	nextParams.set('pageSize', String(nextQuery.pageSize));

	if (nextQuery.search) {
		nextParams.set('search', nextQuery.search);
	} else {
		nextParams.delete('search');
	}
	if (nextQuery.sortBy && nextQuery.sortDirection) {
		nextParams.set('sortBy', nextQuery.sortBy);
		nextParams.set('sortDirection', nextQuery.sortDirection);
	} else {
		nextParams.delete('sortBy');
		nextParams.delete('sortDirection');
	}
	if (nextQuery.programId) {
		nextParams.set('programId', nextQuery.programId);
	} else {
		nextParams.delete('programId');
	}
	if (nextQuery.localPartnerId) {
		nextParams.set('localPartnerId', nextQuery.localPartnerId);
	} else {
		nextParams.delete('localPartnerId');
	}
	if (nextQuery.country) {
		nextParams.set('country', nextQuery.country);
	} else {
		nextParams.delete('country');
	}
	if (nextQuery.currency) {
		nextParams.set('currency', nextQuery.currency);
	} else {
		nextParams.delete('currency');
	}
	if (nextQuery.gender) {
		nextParams.set('gender', nextQuery.gender);
	} else {
		nextParams.delete('gender');
	}
	if (nextQuery.campaignId) {
		nextParams.set('campaignId', nextQuery.campaignId);
	} else {
		nextParams.delete('campaignId');
	}
	if (nextQuery.paymentEventType) {
		nextParams.set('paymentEventType', nextQuery.paymentEventType);
	} else {
		nextParams.delete('paymentEventType');
	}
	if (nextQuery.payoutStatus) {
		nextParams.set('payoutStatus', nextQuery.payoutStatus);
	} else {
		nextParams.delete('payoutStatus');
	}
	if (nextQuery.recipientStatus) {
		nextParams.set('recipientStatus', nextQuery.recipientStatus);
	} else {
		nextParams.delete('recipientStatus');
	}

	return nextParams;
};

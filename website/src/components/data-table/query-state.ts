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
	organizationId?: string;
	countryId?: string;
	focusId?: string;
	parentProviderId?: string;
	localPartnerId?: string;
	country?: string;
	currency?: string;
	gender?: string;
	campaignId?: string;
	paymentEventType?: string;
	payoutStatus?: string;
	recipientStatus?: string;
	mobileMoneyProviderId?: string;
	subscriptionStatus?: string;
	subscriptionPaymentMethod?: string;
	recipientId?: string;
	contributorId?: string;
	entityType?: string;
	paymentPhone?: string;
	contactPhone?: string;
	firstName?: string;
	lastName?: string;
};

type QueryValue = string | string[] | number | null | undefined;

type TableQueryInput = {
	page?: QueryValue;
	pageSize?: QueryValue;
	search?: QueryValue;
	sortBy?: QueryValue;
	sortDirection?: QueryValue;
	programId?: QueryValue;
	organizationId?: QueryValue;
	countryId?: QueryValue;
	focusId?: QueryValue;
	parentProviderId?: QueryValue;
	localPartnerId?: QueryValue;
	country?: QueryValue;
	currency?: QueryValue;
	gender?: QueryValue;
	campaignId?: QueryValue;
	paymentEventType?: QueryValue;
	payoutStatus?: QueryValue;
	recipientStatus?: QueryValue;
	mobileMoneyProviderId?: QueryValue;
	subscriptionStatus?: QueryValue;
	subscriptionPaymentMethod?: QueryValue;
	recipientId?: QueryValue;
	contributorId?: QueryValue;
	entityType?: QueryValue;
	paymentPhone?: QueryValue;
	contactPhone?: QueryValue;
	firstName?: QueryValue;
	lastName?: QueryValue;
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
	const organizationId = normalizeToken(input.organizationId, MAX_QUERY_TOKEN_LENGTH);
	const countryId = normalizeToken(input.countryId, MAX_QUERY_TOKEN_LENGTH);
	const focusId = normalizeToken(input.focusId, MAX_QUERY_TOKEN_LENGTH);
	const parentProviderId = normalizeToken(input.parentProviderId, MAX_QUERY_TOKEN_LENGTH);
	const localPartnerId = normalizeToken(input.localPartnerId, MAX_QUERY_TOKEN_LENGTH);
	const country = normalizeToken(input.country, MAX_QUERY_TOKEN_LENGTH);
	const currency = normalizeToken(input.currency, MAX_QUERY_TOKEN_LENGTH);
	const gender = normalizeToken(input.gender, MAX_QUERY_TOKEN_LENGTH);
	const campaignId = normalizeToken(input.campaignId, MAX_QUERY_TOKEN_LENGTH);
	const paymentEventType = normalizeToken(input.paymentEventType, MAX_QUERY_TOKEN_LENGTH);
	const payoutStatus = normalizeToken(input.payoutStatus, MAX_QUERY_TOKEN_LENGTH);
	const recipientStatus = normalizeToken(input.recipientStatus, MAX_QUERY_TOKEN_LENGTH);
	const mobileMoneyProviderId = normalizeToken(input.mobileMoneyProviderId, MAX_QUERY_TOKEN_LENGTH);
	const subscriptionStatus = normalizeToken(input.subscriptionStatus, MAX_QUERY_TOKEN_LENGTH);
	const subscriptionPaymentMethod = normalizeToken(input.subscriptionPaymentMethod, MAX_QUERY_TOKEN_LENGTH);
	const recipientId = normalizeToken(input.recipientId, MAX_QUERY_TOKEN_LENGTH);
	const contributorId = normalizeToken(input.contributorId, MAX_QUERY_TOKEN_LENGTH);
	const entityType = normalizeToken(input.entityType, MAX_QUERY_TOKEN_LENGTH);
	const paymentPhone = normalizeToken(input.paymentPhone, MAX_SEARCH_LENGTH);
	const contactPhone = normalizeToken(input.contactPhone, MAX_SEARCH_LENGTH);
	const firstName = normalizeToken(input.firstName, MAX_SEARCH_LENGTH);
	const lastName = normalizeToken(input.lastName, MAX_SEARCH_LENGTH);

	return {
		page,
		pageSize,
		search,
		sortBy: sortBy || undefined,
		sortDirection: sortBy ? sortDirection : undefined,
		programId: programId || undefined,
		organizationId: organizationId || undefined,
		countryId: countryId || undefined,
		focusId: focusId || undefined,
		parentProviderId: parentProviderId || undefined,
		localPartnerId: localPartnerId || undefined,
		country: country || undefined,
		currency: currency || undefined,
		gender: gender || undefined,
		campaignId: campaignId || undefined,
		paymentEventType: paymentEventType || undefined,
		payoutStatus: payoutStatus || undefined,
		recipientStatus: recipientStatus || undefined,
		mobileMoneyProviderId: mobileMoneyProviderId || undefined,
		subscriptionStatus: subscriptionStatus || undefined,
		subscriptionPaymentMethod: subscriptionPaymentMethod || undefined,
		recipientId: recipientId || undefined,
		contributorId: contributorId || undefined,
		entityType: entityType || undefined,
		paymentPhone: paymentPhone || undefined,
		contactPhone: contactPhone || undefined,
		firstName: firstName || undefined,
		lastName: lastName || undefined,
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
		organizationId: searchParams.organizationId,
		countryId: searchParams.countryId,
		focusId: searchParams.focusId,
		parentProviderId: searchParams.parentProviderId,
		localPartnerId: searchParams.localPartnerId,
		country: searchParams.country,
		currency: searchParams.currency,
		gender: searchParams.gender,
		campaignId: searchParams.campaignId,
		paymentEventType: searchParams.paymentEventType,
		payoutStatus: searchParams.payoutStatus,
		recipientStatus: searchParams.recipientStatus,
		mobileMoneyProviderId: searchParams.mobileMoneyProviderId,
		subscriptionStatus: searchParams.subscriptionStatus,
		subscriptionPaymentMethod: searchParams.subscriptionPaymentMethod,
		recipientId: searchParams.recipientId,
		contributorId: searchParams.contributorId,
		entityType: searchParams.entityType,
		paymentPhone: searchParams.paymentPhone,
		contactPhone: searchParams.contactPhone,
		firstName: searchParams.firstName,
		lastName: searchParams.lastName,
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
		organizationId: hasPatchKey('organizationId') ? patch.organizationId : currentSearchParams.get('organizationId'),
		countryId: hasPatchKey('countryId') ? patch.countryId : currentSearchParams.get('countryId'),
		focusId: hasPatchKey('focusId') ? patch.focusId : currentSearchParams.get('focusId'),
		parentProviderId: hasPatchKey('parentProviderId') ? patch.parentProviderId : currentSearchParams.get('parentProviderId'),
		localPartnerId: hasPatchKey('localPartnerId') ? patch.localPartnerId : currentSearchParams.get('localPartnerId'),
		country: hasPatchKey('country') ? patch.country : currentSearchParams.get('country'),
		currency: hasPatchKey('currency') ? patch.currency : currentSearchParams.get('currency'),
		gender: hasPatchKey('gender') ? patch.gender : currentSearchParams.get('gender'),
		campaignId: hasPatchKey('campaignId') ? patch.campaignId : currentSearchParams.get('campaignId'),
		paymentEventType: hasPatchKey('paymentEventType') ? patch.paymentEventType : currentSearchParams.get('paymentEventType'),
		payoutStatus: hasPatchKey('payoutStatus') ? patch.payoutStatus : currentSearchParams.get('payoutStatus'),
		recipientStatus: hasPatchKey('recipientStatus') ? patch.recipientStatus : currentSearchParams.get('recipientStatus'),
		mobileMoneyProviderId: hasPatchKey('mobileMoneyProviderId')
			? patch.mobileMoneyProviderId
			: currentSearchParams.get('mobileMoneyProviderId'),
		subscriptionStatus: hasPatchKey('subscriptionStatus')
			? patch.subscriptionStatus
			: currentSearchParams.get('subscriptionStatus'),
		subscriptionPaymentMethod: hasPatchKey('subscriptionPaymentMethod')
			? patch.subscriptionPaymentMethod
			: currentSearchParams.get('subscriptionPaymentMethod'),
		recipientId: hasPatchKey('recipientId') ? patch.recipientId : currentSearchParams.get('recipientId'),
		contributorId: hasPatchKey('contributorId') ? patch.contributorId : currentSearchParams.get('contributorId'),
		entityType: hasPatchKey('entityType') ? patch.entityType : currentSearchParams.get('entityType'),
		paymentPhone: hasPatchKey('paymentPhone') ? patch.paymentPhone : currentSearchParams.get('paymentPhone'),
		contactPhone: hasPatchKey('contactPhone') ? patch.contactPhone : currentSearchParams.get('contactPhone'),
		firstName: hasPatchKey('firstName') ? patch.firstName : currentSearchParams.get('firstName'),
		lastName: hasPatchKey('lastName') ? patch.lastName : currentSearchParams.get('lastName'),
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
	if (nextQuery.organizationId) {
		nextParams.set('organizationId', nextQuery.organizationId);
	} else {
		nextParams.delete('organizationId');
	}
	if (nextQuery.countryId) {
		nextParams.set('countryId', nextQuery.countryId);
	} else {
		nextParams.delete('countryId');
	}
	if (nextQuery.focusId) {
		nextParams.set('focusId', nextQuery.focusId);
	} else {
		nextParams.delete('focusId');
	}
	if (nextQuery.parentProviderId) {
		nextParams.set('parentProviderId', nextQuery.parentProviderId);
	} else {
		nextParams.delete('parentProviderId');
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
	if (nextQuery.mobileMoneyProviderId) {
		nextParams.set('mobileMoneyProviderId', nextQuery.mobileMoneyProviderId);
	} else {
		nextParams.delete('mobileMoneyProviderId');
	}
	if (nextQuery.subscriptionStatus) {
		nextParams.set('subscriptionStatus', nextQuery.subscriptionStatus);
	} else {
		nextParams.delete('subscriptionStatus');
	}
	if (nextQuery.subscriptionPaymentMethod) {
		nextParams.set('subscriptionPaymentMethod', nextQuery.subscriptionPaymentMethod);
	} else {
		nextParams.delete('subscriptionPaymentMethod');
	}
	if (nextQuery.recipientId) {
		nextParams.set('recipientId', nextQuery.recipientId);
	} else {
		nextParams.delete('recipientId');
	}
	if (nextQuery.contributorId) {
		nextParams.set('contributorId', nextQuery.contributorId);
	} else {
		nextParams.delete('contributorId');
	}
	if (nextQuery.entityType) {
		nextParams.set('entityType', nextQuery.entityType);
	} else {
		nextParams.delete('entityType');
	}
	if (nextQuery.paymentPhone) {
		nextParams.set('paymentPhone', nextQuery.paymentPhone);
	} else {
		nextParams.delete('paymentPhone');
	}
	if (nextQuery.contactPhone) {
		nextParams.set('contactPhone', nextQuery.contactPhone);
	} else {
		nextParams.delete('contactPhone');
	}
	if (nextQuery.firstName) {
		nextParams.set('firstName', nextQuery.firstName);
	} else {
		nextParams.delete('firstName');
	}
	if (nextQuery.lastName) {
		nextParams.set('lastName', nextQuery.lastName);
	} else {
		nextParams.delete('lastName');
	}

	return nextParams;
};

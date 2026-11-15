import type { Prisma } from '@/generated/prisma/client';
import { Gender, Profile, type CountryCode } from '@/generated/prisma/enums';
import { prisma } from '@/lib/database/prisma';
import { now } from '@/lib/utils/now';
import { toSortKey } from '@/lib/utils/to-sort-key';
import type { CandidatesTableQuery, UnassignedCandidateFilter } from './candidate.types';

export const findCandidateById = async (candidateId: string) =>
	prisma.recipient.findUnique({
		where: { id: candidateId },
		select: {
			...candidatePayloadSelect,
			programId: true,
			localPartnerId: true,
		},
	});

export const findPaginatedCandidates = async ({
	query,
	localPartnerId,
	country,
	gender,
	allowedCountryCodes,
}: {
	query: CandidatesTableQuery;
	localPartnerId?: string;
	country?: CountryCode;
	gender?: Gender;
	allowedCountryCodes?: CountryCode[];
}) => {
	const where = buildCandidateTableWhere(
		query.search,
		localPartnerId ?? query.localPartnerId,
		country,
		gender,
		allowedCountryCodes,
	);
	const filterWhere: Prisma.RecipientWhereInput = {
		programId: null,
		...(localPartnerId ? { localPartnerId } : {}),
		...(allowedCountryCodes !== undefined ? { AND: [buildLocalPartnerCountryFilter(allowedCountryCodes)] } : {}),
	};

	const [candidates, totalCount, filterSource] = await Promise.all([
		prisma.recipient.findMany({
			where,
			select: candidateTableSelect,
			orderBy: buildCandidateOrderBy(query),
			skip: (query.page - 1) * query.pageSize,
			take: query.pageSize,
		}),
		prisma.recipient.count({ where }),
		prisma.recipient.findMany({
			where: filterWhere,
			select: candidateFilterSelect,
		}),
	]);

	return { candidates, totalCount, filterSource };
};

export const findCandidateForUpdate = async (candidateId: string) =>
	prisma.recipient.findUnique({
		where: { id: candidateId },
		select: {
			localPartnerId: true,
			programId: true,
			contact: {
				select: {
					id: true,
					email: true,
					phone: { select: { id: true, number: true } },
					address: { select: { id: true } },
				},
			},
			paymentInformation: {
				select: {
					id: true,
					code: true,
					phone: { select: { id: true, number: true } },
				},
			},
		},
	});

export const findCandidateForDeletion = async (candidateId: string) =>
	prisma.recipient.findUnique({
		where: { id: candidateId },
		select: {
			id: true,
			contactId: true,
			paymentInformationId: true,
			programId: true,
			localPartnerId: true,
			contact: { select: { phoneId: true, addressId: true } },
			paymentInformation: { select: { phone: { select: { id: true, number: true } } } },
		},
	});

export const findCandidatesForCsvExport = async (localPartnerId?: string) =>
	prisma.recipient.findMany({
		where: {
			programId: null,
			...(localPartnerId ? { localPartnerId } : {}),
		},
		select: candidateCsvSelect,
		orderBy: { createdAt: 'desc' },
	});

export const findContactByEmail = async (email: string) =>
	prisma.contact.findUnique({ where: { email }, select: { id: true } });

export const findPhoneByNumber = async (number: string) =>
	prisma.phone.findUnique({ where: { number }, select: { id: true } });

export const findPaymentInformationByCode = async (code: string) =>
	prisma.paymentInformation.findUnique({ where: { code }, select: { id: true } });

export const countCandidates = async (filter: UnassignedCandidateFilter) =>
	prisma.recipient.count({ where: buildCandidateWhere(filter) });

export const findUnassignedCandidateIds = async (filter: UnassignedCandidateFilter) =>
	prisma.recipient.findMany({ where: buildCandidateWhere(filter), select: { id: true } });

export const findLocalPartnersWithUnassignedCandidates = async (countryCode: CountryCode) =>
	prisma.localPartner.findMany({
		where: {
			recipients: {
				some: buildCandidateWhere({ countryCode, focusIds: [], profiles: [], localPartnerIds: [] }),
			},
		},
		select: { id: true, name: true },
		orderBy: { name: 'asc' },
	});

export const candidatePayloadSelect = {
	id: true,
	suspendedAt: true,
	suspensionReason: true,
	successorName: true,
	termsAccepted: true,
	localPartner: { select: { id: true, name: true } },
	contact: {
		select: {
			id: true,
			firstName: true,
			lastName: true,
			callingName: true,
			email: true,
			gender: true,
			language: true,
			dateOfBirth: true,
			profession: true,
			phone: true,
			address: true,
		},
	},
	paymentInformation: {
		select: {
			id: true,
			code: true,
			mobileMoneyProvider: { select: { id: true, name: true } },
			phone: true,
		},
	},
} as const;

const candidateTableSelect = {
	id: true,
	suspendedAt: true,
	suspensionReason: true,
	contact: {
		select: {
			firstName: true,
			lastName: true,
			dateOfBirth: true,
			gender: true,
			address: { select: { country: true } },
			phone: { select: { number: true } },
		},
	},
	localPartner: {
		select: {
			id: true,
			name: true,
			contact: { select: { address: { select: { country: true } } } },
		},
	},
} as const;

const candidateFilterSelect = {
	contact: {
		select: {
			gender: true,
			address: { select: { country: true } },
		},
	},
	localPartner: {
		select: {
			id: true,
			name: true,
			contact: { select: { address: { select: { country: true } } } },
		},
	},
} as const;

const candidateCsvSelect = {
	id: true,
	createdAt: true,
	updatedAt: true,
	suspendedAt: true,
	suspensionReason: true,
	successorName: true,
	termsAccepted: true,
	localPartner: {
		select: {
			id: true,
			name: true,
			contact: { select: { address: { select: { country: true } } } },
		},
	},
	contact: {
		select: {
			id: true,
			firstName: true,
			lastName: true,
			callingName: true,
			email: true,
			gender: true,
			language: true,
			dateOfBirth: true,
			profession: true,
			phone: { select: { number: true } },
			address: {
				select: {
					street: true,
					number: true,
					zip: true,
					city: true,
					country: true,
				},
			},
		},
	},
	paymentInformation: {
		select: {
			id: true,
			code: true,
			phone: { select: { number: true } },
			mobileMoneyProvider: { select: { id: true, name: true } },
		},
	},
} as const;

const buildCandidateOrderBy = (query: CandidatesTableQuery): Prisma.RecipientOrderByWithRelationInput[] => {
	const direction: Prisma.SortOrder = query.sortDirection === 'asc' ? 'asc' : 'desc';
	const sortBy = toSortKey(query.sortBy, [
		'id',
		'candidate',
		'country',
		'gender',
		'dateOfBirth',
		'contactNumber',
		'localPartnerName',
	] as const);

	switch (sortBy) {
		case 'id':
			return [{ id: direction }];
		case 'candidate':
			return [{ contact: { firstName: direction } }, { contact: { lastName: direction } }];
		case 'country':
			return [{ contact: { address: { country: direction } } }];
		case 'gender':
			return [{ contact: { gender: direction } }];
		case 'dateOfBirth':
			return [{ contact: { dateOfBirth: direction } }];
		case 'contactNumber':
			return [{ contact: { phone: { number: direction } } }];
		case 'localPartnerName':
			return [{ localPartner: { name: direction } }];
		default:
			return [{ createdAt: 'desc' }];
	}
};

const buildCandidateTableWhere = (
	searchInput: string,
	localPartnerIdInput: string | undefined,
	country: CountryCode | undefined,
	gender: Gender | undefined,
	allowedCountryCodes: CountryCode[] | undefined,
): Prisma.RecipientWhereInput => {
	const search = searchInput.trim();
	const trimmedLocalPartnerId = localPartnerIdInput?.trim();
	const localPartnerId = trimmedLocalPartnerId === '' ? undefined : trimmedLocalPartnerId;
	const baseScope: Prisma.RecipientWhereInput = {
		programId: null,
		...(localPartnerId ? { localPartnerId } : {}),
		...(gender ? { contact: { gender } } : {}),
	};
	const countryScopes = [
		...(allowedCountryCodes !== undefined ? [buildLocalPartnerCountryFilter(allowedCountryCodes)] : []),
		...(country ? [buildCountryFilter(country)] : []),
	];

	if (!search) {
		return countryScopes.length ? { AND: [baseScope, ...countryScopes] } : baseScope;
	}

	return {
		AND: [
			baseScope,
			...countryScopes,
			{
				OR: [
					{ id: { contains: search, mode: 'insensitive' } },
					{ contact: { firstName: { contains: search, mode: 'insensitive' } } },
					{ contact: { lastName: { contains: search, mode: 'insensitive' } } },
					{ contact: { phone: { number: { contains: search, mode: 'insensitive' } } } },
					...(localPartnerId ? [] : [{ localPartner: { name: { contains: search, mode: 'insensitive' as const } } }]),
				],
			},
		],
	};
};

const buildCountryFilter = (countryCode: CountryCode): Prisma.RecipientWhereInput => ({
	OR: [
		{ contact: { address: { country: countryCode } } },
		{
			AND: [
				{ OR: [{ contact: { address: null } }, { contact: { address: { country: null } } }] },
				{ localPartner: { contact: { address: { country: countryCode } } } },
			],
		},
	],
});

const buildLocalPartnerCountryFilter = (countryCodes: CountryCode[]): Prisma.RecipientWhereInput => ({
	localPartner: { contact: { address: { country: { in: countryCodes } } } },
});

const buildCandidateWhere = (filter: UnassignedCandidateFilter): Prisma.RecipientWhereInput => {
	const andFilters: Prisma.RecipientWhereInput[] = [];
	if (filter.countryCode) {
		andFilters.push(buildCountryFilter(filter.countryCode));
	}
	if (filter.localPartnerIds.length) {
		andFilters.push({ localPartnerId: { in: filter.localPartnerIds } });
	}
	if (filter.focusIds.length) {
		andFilters.push({
			OR: filter.focusIds.map((focusId) => ({
				localPartner: { focuses: { some: { focusId } } },
			})),
		});
	}

	const profileFilter = buildProfileFilter(filter.profiles);
	if (profileFilter) {
		andFilters.push(profileFilter);
	}

	return {
		programId: null,
		...(andFilters.length ? { AND: andFilters } : {}),
	};
};

const buildProfileFilter = (profiles: Profile[]): Prisma.RecipientWhereInput | null => {
	const genderFilters: Prisma.ContactWhereInput[] = [];
	if (profiles.includes(Profile.male)) {
		genderFilters.push({ gender: Gender.male });
	}
	if (profiles.includes(Profile.female)) {
		genderFilters.push({ gender: Gender.female });
	}

	const contactFilters: Prisma.ContactWhereInput[] = [];
	if (genderFilters.length === 1) {
		const [genderFilter] = genderFilters;
		if (genderFilter) {
			contactFilters.push(genderFilter);
		}
	} else if (genderFilters.length > 1) {
		contactFilters.push({ OR: genderFilters });
	}
	if (profiles.includes(Profile.youth)) {
		const currentDate = now();
		contactFilters.push({
			dateOfBirth: {
				gte: new Date(currentDate.getFullYear() - 25, currentDate.getMonth(), currentDate.getDate()),
			},
		});
	}
	if (contactFilters.length === 1) {
		const [contactFilter] = contactFilters;

		return contactFilter ? { contact: contactFilter } : null;
	}
	if (contactFilters.length > 1) {
		return { contact: { AND: contactFilters } };
	}

	return null;
};

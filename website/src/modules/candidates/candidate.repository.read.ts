import type { Prisma } from '@/generated/prisma/client';
import { Gender, Profile, type CountryCode } from '@/generated/prisma/enums';
import { prisma } from '@/lib/database/prisma';
import { now } from '@/lib/utils/now';
import { toSortKey } from '@/lib/utils/to-sort-key';
import type { CandidatesTableQuery } from './candidate.types';

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
}: {
	query: CandidatesTableQuery;
	localPartnerId?: string;
	country?: CountryCode;
	gender?: Gender;
}) => {
	const where = buildCandidateTableWhere(query.search, localPartnerId ?? query.localPartnerId, country, gender);
	const filterWhere: Prisma.RecipientWhereInput = {
		programId: null,
		...(localPartnerId ? { localPartnerId } : {}),
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

export const countCandidates = async (
	focuses?: string[],
	profiles?: Profile[],
	countryCode?: CountryCode | null,
	localPartnerIds?: string[],
) => prisma.recipient.count({ where: buildCandidateWhere(focuses, profiles, countryCode, localPartnerIds) });

export const findCandidateIdsForAssignment = async (
	focuses: string[] | undefined,
	profiles: Profile[] | undefined,
	countryCode: CountryCode,
	localPartnerIds?: string[],
) =>
	prisma.recipient.findMany({
		where: buildCandidateWhere(focuses, profiles, countryCode, localPartnerIds),
		select: { id: true },
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
): Prisma.RecipientWhereInput => {
	const search = searchInput.trim();
	const trimmedLocalPartnerId = localPartnerIdInput?.trim();
	const localPartnerId = trimmedLocalPartnerId === '' ? undefined : trimmedLocalPartnerId;
	const baseScope: Prisma.RecipientWhereInput = {
		programId: null,
		...(localPartnerId ? { localPartnerId } : {}),
		...(gender ? { contact: { gender } } : {}),
	};
	const countryScope = country ? buildCountryFilter(country) : null;

	if (!search) {
		return countryScope ? { AND: [baseScope, countryScope] } : baseScope;
	}

	return {
		AND: [
			baseScope,
			...(countryScope ? [countryScope] : []),
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

const buildCandidateWhere = (
	focuses?: string[],
	profiles?: Profile[],
	countryCode?: CountryCode | null,
	localPartnerIds?: string[],
): Prisma.RecipientWhereInput => {
	const andFilters: Prisma.RecipientWhereInput[] = [];
	if (countryCode) {
		andFilters.push(buildCountryFilter(countryCode));
	}
	if (localPartnerIds?.length) {
		andFilters.push({ localPartnerId: { in: localPartnerIds } });
	}
	if (focuses?.length) {
		andFilters.push(
			...focuses.map((focusId) => ({
				localPartner: { focuses: { some: { focusId } } },
			})),
		);
	}
	if (profiles?.length) {
		const contactFilters: Prisma.ContactWhereInput[] = [];
		if (profiles.includes(Profile.male)) {
			contactFilters.push({ gender: Gender.male });
		}
		if (profiles.includes(Profile.female)) {
			contactFilters.push({ gender: Gender.female });
		}
		if (profiles.includes(Profile.youth)) {
			const currentDate = now();
			contactFilters.push({
				dateOfBirth: {
					gte: new Date(currentDate.getFullYear() - 25, currentDate.getMonth(), currentDate.getDate()),
				},
			});
		}
		if (contactFilters.length) {
			andFilters.push({ contact: { AND: contactFilters } });
		}
	}

	return {
		programId: null,
		...(andFilters.length ? { AND: andFilters } : {}),
	};
};

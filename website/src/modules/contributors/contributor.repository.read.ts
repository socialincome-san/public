import type { Prisma } from '@/generated/prisma/client';
import { CountryCode } from '@/generated/prisma/enums';
import { prisma } from '@/lib/database/prisma';
import { toSortKey } from '@/lib/utils/to-sort-key';
import type { ContributorTableQuery } from './contributor.types';

export const countContributorsCreatedBetween = async (from: Date, to: Date) =>
	prisma.contributor.count({
		where: { createdAt: { gte: from, lt: to } },
	});

export const findCommunityContributionCountries = async () =>
	prisma.contribution.findMany({
		where: { status: 'succeeded' },
		distinct: ['contributorId'],
		select: {
			contributor: {
				select: {
					contact: {
						select: {
							address: {
								select: { country: true },
							},
						},
					},
				},
			},
		},
	});

export const groupContributionSumsByContributorId = async (contributorIds: string[]) => {
	if (contributorIds.length === 0) {
		return [];
	}

	return prisma.contribution.groupBy({
		by: ['contributorId'],
		where: {
			contributorId: { in: contributorIds },
		},
		_sum: {
			amountChf: true,
		},
	});
};

export const findContributor = async (contributorId: string, accessibleProgramIds: string[]) =>
	prisma.contributor.findFirst({
		where: {
			id: contributorId,
			OR: contributorAccessOr(accessibleProgramIds),
		},
		select: contributorDetailSelect,
	});

export const findContributorFilterOption = async (contributorId: string, accessibleProgramIds: string[]) =>
	prisma.contributor.findFirst({
		where: { id: contributorId, OR: contributorAccessOr(accessibleProgramIds) },
		select: { id: true, contact: { select: { firstName: true, lastName: true } } },
	});

export const findEditableContributorOptions = async (accessibleProgramIds: string[]) =>
	prisma.contributor.findMany({
		where: {
			OR: contributorAccessOr(accessibleProgramIds),
		},
		select: {
			id: true,
			contact: {
				select: {
					firstName: true,
					lastName: true,
				},
			},
		},
		orderBy: { contact: { firstName: 'asc' } },
	});

export const findContributorCountryFilterSource = async (accessibleProgramIds: string[]) =>
	prisma.contributor.findMany({
		where: {
			OR: contributorAccessOr(accessibleProgramIds),
		},
		select: {
			contact: {
				select: {
					address: {
						select: {
							country: true,
						},
					},
				},
			},
		},
	});

export const findContributorTableSource = async ({
	accessibleProgramIds,
	query,
	country,
	paginate,
}: {
	accessibleProgramIds: string[];
	query: ContributorTableQuery;
	country: CountryCode | undefined;
	paginate: boolean;
}) => {
	const where = buildContributorTableWhere(accessibleProgramIds, query.search, country);
	if (paginate) {
		const [contributors, totalCount] = await Promise.all([
			prisma.contributor.findMany({
				where,
				select: contributorTableSelect,
				orderBy: buildContributorOrderBy(query),
				skip: (query.page - 1) * query.pageSize,
				take: query.pageSize,
			}),
			prisma.contributor.count({ where }),
		]);

		return { contributors, totalCount };
	}

	const [contributors, totalCount] = await Promise.all([
		prisma.contributor.findMany({
			where,
			select: contributorTableSelect,
			orderBy: buildContributorOrderBy(query),
		}),
		prisma.contributor.count({ where }),
	]);

	return { contributors, totalCount };
};

export const findContributorsForDonationCertificates = async ({
	contributorIds,
	accessibleProgramIds,
}: {
	contributorIds?: string[];
	accessibleProgramIds?: string[];
}) =>
	prisma.contributor.findMany({
		where: {
			...(contributorIds && contributorIds.length > 0 ? { id: { in: contributorIds } } : {}),
			...(accessibleProgramIds
				? {
						contributions: {
							some: {
								campaign: {
									programId: {
										in: accessibleProgramIds,
									},
								},
							},
						},
					}
				: {}),
		},
		select: contributorDonationCertificateSelect,
		orderBy: { contact: { firstName: 'asc' } },
	});

export const findContributorByStripeCustomerId = async (stripeCustomerId: string) =>
	prisma.contributor.findFirst({
		where: { stripeCustomerId },
		select: contributorWithContactSelect,
	});

export const findContributorByEmail = async (email: string) =>
	prisma.contributor.findFirst({
		where: { contact: { email } },
		select: contributorWithContactSelect,
	});

export const findContributorSessionByFirebaseAuthUserId = async (firebaseAuthUserId: string) =>
	prisma.contributor.findFirst({
		where: { account: { firebaseAuthUserId } },
		select: contributorSessionSelect,
	});

export const findContributorsByPaymentReferenceIds = async (paymentReferenceIds: string[]) =>
	prisma.contributor.findMany({
		where: { paymentReferenceId: { in: paymentReferenceIds } },
		select: contributorWithContactSelect,
	});

export const findContributorForSelfUpdate = async (contributorId: string) =>
	prisma.contributor.findUnique({
		where: { id: contributorId },
		select: {
			account: {
				select: {
					firebaseAuthUserId: true,
				},
			},
			contact: {
				select: {
					id: true,
					email: true,
					address: {
						select: { id: true },
					},
				},
			},
		},
	});

export const findContributorForPortalUpdate = async (contributorId: string) =>
	prisma.contributor.findUnique({
		where: { id: contributorId },
		select: {
			id: true,
			account: { select: { firebaseAuthUserId: true } },
			contact: {
				select: {
					id: true,
					firstName: true,
					lastName: true,
					email: true,
					phone: { select: { id: true, number: true } },
					address: { select: { id: true } },
				},
			},
		},
	});

export const findContributorProgramIds = async (contributorId: string) =>
	prisma.contribution.findMany({
		where: { contributorId },
		select: { campaign: { select: { programId: true } } },
	});

export const findContributorByAccountId = async (accountId: string) =>
	prisma.contributor.findUnique({
		where: { accountId },
		select: contributorWithContactSelect,
	});

export const findContributorPaymentReferenceByEmail = async (email: string) =>
	prisma.contributor.findFirst({
		where: { contact: { email } },
		select: { id: true, contact: { select: { email: true } }, paymentReferenceId: true },
	});

export const findContributorPaymentReferenceById = async (contributorId: string) =>
	prisma.contributor.findUnique({
		where: { id: contributorId },
		select: { id: true, contact: { select: { email: true } }, paymentReferenceId: true },
	});

export const findContributorByPaymentReferenceId = async (paymentReferenceId: string) =>
	prisma.contributor.findFirst({
		where: { paymentReferenceId },
		select: contributorRecordSelect,
	});

export const findContributorIdByEmail = async (email: string) =>
	prisma.contributor.findFirst({
		where: { contact: { email } },
		select: { id: true, paymentReferenceId: true },
	});

export const findContributorRecord = async (contributorId: string) =>
	prisma.contributor.findUnique({
		where: { id: contributorId },
		select: contributorRecordSelect,
	});

export const findContributorId = async (contributorId: string) =>
	prisma.contributor.findUnique({
		where: { id: contributorId },
		select: { id: true },
	});

export const findContributorByEmailOrFirebaseAuthUserId = async (email: string, firebaseAuthUserId: string) =>
	prisma.contributor.findFirst({
		where: {
			OR: [{ contact: { email } }, { account: { firebaseAuthUserId } }],
		},
		select: contributorWithContactSelect,
	});

export const findContactByEmail = async (email: string) =>
	prisma.contact.findUnique({
		where: { email },
		select: { id: true },
	});

export const findPhoneByNumber = async (number: string) =>
	prisma.phone.findUnique({
		where: { number },
		select: { id: true },
	});

const contributorAccessOr = (accessibleProgramIds: string[]): Prisma.ContributorWhereInput[] => [
	{
		contributions: {
			some: {
				campaign: {
					programId: {
						in: accessibleProgramIds,
					},
				},
			},
		},
	},
	{
		contributions: {
			none: {},
		},
	},
];

const buildContributorTableWhere = (
	accessibleProgramIds: string[],
	searchInput: string,
	country: CountryCode | undefined,
): Prisma.ContributorWhereInput => {
	const search = searchInput.trim();
	const baseScope: Prisma.ContributorWhereInput = {
		OR: contributorAccessOr(accessibleProgramIds),
	};
	const countryFilter: Prisma.ContributorWhereInput[] = country ? [{ contact: { address: { country } } }] : [];

	if (!search) {
		if (countryFilter.length === 0) {
			return baseScope;
		}

		return {
			AND: [baseScope, ...countryFilter],
		};
	}

	return {
		AND: [
			baseScope,
			...countryFilter,
			{
				OR: [
					{ id: { contains: search, mode: 'insensitive' } },
					{ contact: { firstName: { contains: search, mode: 'insensitive' } } },
					{ contact: { lastName: { contains: search, mode: 'insensitive' } } },
					{ contact: { email: { contains: search, mode: 'insensitive' } } },
					{ account: { firebaseAuthUserId: { contains: search, mode: 'insensitive' } } },
				],
			},
		],
	};
};

const buildContributorOrderBy = (query: ContributorTableQuery): Prisma.ContributorOrderByWithRelationInput[] => {
	const direction: Prisma.SortOrder = query.sortDirection === 'asc' ? 'asc' : 'desc';
	const sortBy = toSortKey(query.sortBy, ['id', 'contributor', 'email', 'firebaseAuthUserId', 'country', 'createdAt']);

	switch (sortBy) {
		case 'id':
			return [{ id: direction }];
		case 'contributor':
			return [{ contact: { firstName: direction } }, { contact: { lastName: direction } }];
		case 'email':
			return [{ contact: { email: direction } }];
		case 'firebaseAuthUserId':
			return [{ account: { firebaseAuthUserId: direction } }];
		case 'country':
			return [{ contact: { address: { country: direction } } }];
		case 'createdAt':
			return [{ createdAt: direction }];
		default:
			return [{ createdAt: 'desc' }];
	}
};

export const contributorRecordSelect = {
	id: true,
	legacyFirestoreId: true,
	accountId: true,
	contactId: true,
	referral: true,
	needsOnboarding: true,
	paymentReferenceId: true,
	stripeCustomerId: true,
	createdAt: true,
	updatedAt: true,
} satisfies Prisma.ContributorSelect;

const contributorContactRecordSelect = {
	id: true,
	firstName: true,
	lastName: true,
	callingName: true,
	email: true,
	gender: true,
	language: true,
	dateOfBirth: true,
	profession: true,
	phoneId: true,
	addressId: true,
	isInstitution: true,
	createdAt: true,
	updatedAt: true,
} satisfies Prisma.ContactSelect;

export const contributorWithContactSelect = {
	...contributorRecordSelect,
	contact: {
		select: {
			...contributorContactRecordSelect,
			address: {
				select: {
					id: true,
					street: true,
					number: true,
					city: true,
					zip: true,
					country: true,
					createdAt: true,
					updatedAt: true,
				},
			},
		},
	},
} satisfies Prisma.ContributorSelect;

const contributorDetailSelect = {
	id: true,
	referral: true,
	paymentReferenceId: true,
	stripeCustomerId: true,
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
			phone: {
				select: {
					id: true,
					number: true,
					hasWhatsApp: true,
					createdAt: true,
					updatedAt: true,
				},
			},
			address: {
				select: {
					id: true,
					street: true,
					number: true,
					city: true,
					zip: true,
					country: true,
					createdAt: true,
					updatedAt: true,
				},
			},
		},
	},
} satisfies Prisma.ContributorSelect;

const contributorTableSelect = {
	id: true,
	createdAt: true,
	account: {
		select: {
			firebaseAuthUserId: true,
		},
	},
	contact: {
		select: {
			firstName: true,
			lastName: true,
			email: true,
			address: { select: { country: true } },
		},
	},
} satisfies Prisma.ContributorSelect;

const contributorDonationCertificateSelect = {
	id: true,
	account: {
		select: {
			firebaseAuthUserId: true,
		},
	},
	contact: {
		select: {
			firstName: true,
			lastName: true,
			language: true,
			email: true,
			address: {
				select: {
					id: true,
					street: true,
					number: true,
					city: true,
					zip: true,
					country: true,
					createdAt: true,
					updatedAt: true,
				},
			},
		},
	},
} satisfies Prisma.ContributorSelect;

const contributorSessionSelect = {
	id: true,
	stripeCustomerId: true,
	referral: true,
	contact: {
		select: {
			gender: true,
			email: true,
			firstName: true,
			lastName: true,
			language: true,
			address: {
				select: {
					street: true,
					number: true,
					city: true,
					zip: true,
					country: true,
				},
			},
		},
	},
} satisfies Prisma.ContributorSelect;

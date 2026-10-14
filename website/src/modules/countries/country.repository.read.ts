import type { Prisma } from '@/generated/prisma/client';
import { CountryCode, NetworkTechnology } from '@/generated/prisma/enums';
import { prisma } from '@/lib/database/prisma';
import { toSortKey } from '@/lib/utils/to-sort-key';
import type { CountryTableQuery } from './country.types';

export const countryPayloadSelect = {
	id: true,
	isoCode: true,
	isActive: true,
	currency: true,
	defaultPayoutAmount: true,
	microfinanceIndex: true,
	cashConditionOverride: true,
	populationCoverage: true,
	latestSurveyDate: true,
	networkTechnology: true,
	mobileMoneyConditionOverride: true,
	sanctions: true,
	microfinanceSourceLink: {
		select: {
			id: true,
			text: true,
			href: true,
		},
	},
	networkSourceLink: {
		select: {
			id: true,
			text: true,
			href: true,
		},
	},
	mobileMoneyProviders: {
		select: {
			mobileMoneyProvider: {
				select: {
					id: true,
					name: true,
				},
			},
		},
	},
} as const;

export const findCountryById = async (countryId: string) =>
	prisma.country.findUnique({
		where: { id: countryId },
		select: countryPayloadSelect,
	});

export const findPaginatedCountries = async (query: CountryTableQuery) => {
	const search = query.search.trim();
	const matchedIsoCode = Object.values(CountryCode).find((code) => code.toLowerCase() === search.toLowerCase());
	const matchedNetworkTechnology = Object.values(NetworkTechnology).find(
		(technology) => technology.toLowerCase() === search.toLowerCase(),
	);
	const where: Prisma.CountryWhereInput = {
		...(query.mobileMoneyProviderId
			? { mobileMoneyProviders: { some: { mobileMoneyProviderId: query.mobileMoneyProviderId } } }
			: {}),
		...(search
			? {
					OR: [
						{ id: { contains: search, mode: 'insensitive' } },
						...(matchedIsoCode ? [{ isoCode: { equals: matchedIsoCode } }] : []),
						...(matchedNetworkTechnology ? [{ networkTechnology: { equals: matchedNetworkTechnology } }] : []),
					],
				}
			: {}),
	};

	const [countries, totalCount] = await Promise.all([
		prisma.country.findMany({
			where,
			select: {
				id: true,
				isoCode: true,
				isActive: true,
				microfinanceIndex: true,
				populationCoverage: true,
				networkTechnology: true,
				latestSurveyDate: true,
				mobileMoneyProviders: {
					select: {
						mobileMoneyProvider: {
							select: {
								id: true,
								name: true,
							},
						},
					},
				},
				sanctions: true,
				createdAt: true,
				updatedAt: true,
			},
			orderBy: buildCountryOrderBy(query),
			skip: (query.page - 1) * query.pageSize,
			take: query.pageSize,
		}),
		prisma.country.count({ where }),
	]);

	return { countries, totalCount };
};

export const findCountriesForFeasibility = async () =>
	prisma.country.findMany({
		select: {
			id: true,
			isoCode: true,
			isActive: true,
			currency: true,
			defaultPayoutAmount: true,
			microfinanceIndex: true,
			cashConditionOverride: true,
			populationCoverage: true,
			networkTechnology: true,
			mobileMoneyConditionOverride: true,
			sanctions: true,
			microfinanceSourceLink: {
				select: {
					text: true,
					href: true,
				},
			},
			networkSourceLink: {
				select: {
					text: true,
					href: true,
				},
			},
			mobileMoneyProviders: {
				select: {
					mobileMoneyProvider: {
						select: {
							id: true,
							name: true,
						},
					},
				},
			},
			programs: {
				select: {
					_count: {
						select: { recipients: true },
					},
				},
			},
			_count: {
				select: { programs: true },
			},
		},
		orderBy: { isoCode: 'asc' },
	});

export const findPublicCountryStats = async (isoCodes: CountryCode[]) =>
	prisma.country.findMany({
		where: { isoCode: { in: isoCodes } },
		select: {
			isoCode: true,
			_count: { select: { programs: true } },
			programs: {
				select: {
					_count: { select: { recipients: true } },
				},
			},
		},
	});

export const findCountryByIsoCode = async (isoCode: CountryCode) =>
	prisma.country.findUnique({
		where: { isoCode },
		select: { id: true, isoCode: true },
	});

export const findCountryForDeletion = async (countryId: string) =>
	prisma.country.findUnique({
		where: { id: countryId },
		select: {
			id: true,
			_count: {
				select: {
					programs: true,
				},
			},
		},
	});

const buildCountryOrderBy = (query: CountryTableQuery): Prisma.CountryOrderByWithRelationInput[] => {
	const direction: Prisma.SortOrder = query.sortDirection === 'asc' ? 'asc' : 'desc';
	const sortBy = toSortKey(query.sortBy, [
		'id',
		'isoCode',
		'isActive',
		'microfinanceIndex',
		'populationCoverage',
		'networkTechnology',
		'latestSurveyDate',
		'updatedAt',
	] as const);

	switch (sortBy) {
		case 'id':
			return [{ id: direction }];
		case 'isoCode':
			return [{ isoCode: direction }];
		case 'isActive':
			return [{ isActive: direction }];
		case 'microfinanceIndex':
			return [{ microfinanceIndex: direction }];
		case 'populationCoverage':
			return [{ populationCoverage: direction }];
		case 'networkTechnology':
			return [{ networkTechnology: direction }];
		case 'latestSurveyDate':
			return [{ latestSurveyDate: direction }];
		case 'updatedAt':
			return [{ updatedAt: direction }];
		default:
			return [{ isoCode: 'asc' }];
	}
};

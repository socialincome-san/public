import { CountryCode, Prisma } from '@/generated/prisma/client';
import { now } from '@/lib/utils/now';
import { Profile } from './candidate.types';

const YOUTH_MAX_AGE_YEARS = 25;

const getYouthCutoffDate = (nowDate: Date) =>
	new Date(nowDate.getFullYear() - YOUTH_MAX_AGE_YEARS, nowDate.getMonth(), nowDate.getDate());

export const buildCountryFilter = (countryCode: CountryCode): Prisma.RecipientWhereInput => ({
	OR: [
		{
			contact: {
				address: {
					country: countryCode,
				},
			},
		},
		{
			AND: [
				{
					OR: [
						{
							contact: {
								address: null,
							},
						},
						{
							contact: {
								address: {
									country: null,
								},
							},
						},
					],
				},
				{
					localPartner: {
						contact: {
							address: {
								country: countryCode,
							},
						},
					},
				},
			],
		},
	],
});

const buildFocusFilters = (focuses: string[]): Prisma.RecipientWhereInput[] =>
	focuses.map((focusId) => ({
		localPartner: {
			focuses: {
				some: {
					focusId,
				},
			},
		},
	}));

const buildProfileFilters = (profiles: Profile[]): Prisma.ContactWhereInput[] => {
	const contactFilters: Prisma.ContactWhereInput[] = [];

	if (profiles.includes(Profile.male)) {
		contactFilters.push({ gender: Profile.male });
	}

	if (profiles.includes(Profile.female)) {
		contactFilters.push({ gender: Profile.female });
	}

	if (profiles.includes(Profile.youth)) {
		contactFilters.push({
			dateOfBirth: {
				gte: getYouthCutoffDate(now()),
			},
		});
	}

	return contactFilters;
};

export const buildCandidateWhere = (
	focuses?: string[],
	profiles?: Profile[],
	countryCode?: CountryCode | null,
): Prisma.RecipientWhereInput => {
	const andFilters: Prisma.RecipientWhereInput[] = [];

	if (countryCode) {
		andFilters.push(buildCountryFilter(countryCode));
	}

	if (focuses && focuses.length > 0) {
		andFilters.push(...buildFocusFilters(focuses));
	}

	if (profiles && profiles.length > 0) {
		const contactFilters = buildProfileFilters(profiles);

		if (contactFilters.length > 0) {
			andFilters.push({
				contact: {
					AND: contactFilters,
				},
			});
		}
	}

	return {
		programId: null,
		...(andFilters.length > 0 ? { AND: andFilters } : {}),
	};
};

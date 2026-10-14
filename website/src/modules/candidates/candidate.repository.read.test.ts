import { CountryCode, Gender, Profile } from '@/generated/prisma/enums';
import { now } from '@/lib/utils/now';

type CountQuery = {
	where: {
		programId: null;
		AND?: unknown[];
	};
};

const mockCount = jest.fn<Promise<number>, [CountQuery]>();
const mockPartnerFindMany = jest.fn<Promise<{ id: string; name: string }[]>, [unknown]>();

jest.mock('@/lib/database/prisma', () => ({
	prisma: {
		recipient: {
			count: mockCount,
		},
		localPartner: {
			findMany: mockPartnerFindMany,
		},
	},
}));

import { countCandidates } from './candidate.repository.read';
import type { UnassignedCandidateFilter } from './candidate.types';

const countryFilter = {
	countryCode: CountryCode.SL,
	focusIds: [],
	profiles: [],
	localPartnerIds: [],
} satisfies UnassignedCandidateFilter;

const youthCutoff = () => {
	const currentDate = now();

	return new Date(currentDate.getFullYear() - 25, currentDate.getMonth(), currentDate.getDate());
};

describe('candidate pool filtering', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockCount.mockResolvedValue(0);
	});

	test('counts every unassigned candidate in the country when no filters are selected', async () => {
		await countCandidates(countryFilter);

		expect(mockCount).toHaveBeenCalledWith({
			where: {
				programId: null,
				AND: [
					{
						OR: [
							{ contact: { address: { country: CountryCode.SL } } },
							{
								AND: [
									{ OR: [{ contact: { address: null } }, { contact: { address: { country: null } } }] },
									{ localPartner: { contact: { address: { country: CountryCode.SL } } } },
								],
							},
						],
					},
				],
			},
		});
	});

	test('combines selected focuses with OR', async () => {
		await countCandidates({ ...countryFilter, focusIds: ['focus-health', 'focus-poverty'] });

		expect(mockCount.mock.calls[0]?.[0].where.AND).toEqual(
			expect.arrayContaining([
				{
					OR: [
						{ localPartner: { focuses: { some: { focusId: 'focus-health' } } } },
						{ localPartner: { focuses: { some: { focusId: 'focus-poverty' } } } },
					],
				},
			]),
		);
	});

	test('treats male and female as alternatives and youth as an additional predicate', async () => {
		await countCandidates({ ...countryFilter, profiles: [Profile.female, Profile.youth] });

		expect(mockCount.mock.calls[0]?.[0].where.AND).toEqual(
			expect.arrayContaining([
				{
					contact: {
						AND: [{ gender: Gender.female }, { dateOfBirth: { gte: youthCutoff() } }],
					},
				},
			]),
		);
	});

	test('treats male and female as alternatives of each other', async () => {
		await countCandidates({ ...countryFilter, profiles: [Profile.male, Profile.female] });

		expect(mockCount.mock.calls[0]?.[0].where.AND).toEqual(
			expect.arrayContaining([
				{
					contact: {
						OR: [{ gender: Gender.male }, { gender: Gender.female }],
					},
				},
			]),
		);
	});

	test('limits candidates to the selected local partners', async () => {
		await countCandidates({ ...countryFilter, localPartnerIds: ['partner-1', 'partner-2'] });

		expect(mockCount.mock.calls[0]?.[0].where.AND).toEqual(
			expect.arrayContaining([{ localPartnerId: { in: ['partner-1', 'partner-2'] } }]),
		);
	});

	test('combines focus, profile, and local partner filters', async () => {
		await countCandidates({
			countryCode: CountryCode.SL,
			focusIds: ['focus-health'],
			profiles: [Profile.male],
			localPartnerIds: ['partner-1'],
		});

		const andFilters = mockCount.mock.calls[0]?.[0].where.AND;
		expect(andFilters).toEqual(
			expect.arrayContaining([
				{ localPartnerId: { in: ['partner-1'] } },
				{ OR: [{ localPartner: { focuses: { some: { focusId: 'focus-health' } } } }] },
				{ contact: { gender: Gender.male } },
			]),
		);
		expect(andFilters).toHaveLength(4);
	});
});

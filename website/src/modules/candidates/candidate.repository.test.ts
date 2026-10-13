import { CountryCode, Gender, Profile } from '@/generated/prisma/enums';
import { now } from '@/lib/utils/now';

type CountQuery = {
	where: {
		programId: null;
		AND?: unknown[];
	};
};

type UpdateQuery = {
	where: { id: { in: string[] }; programId: null };
	data: { programId: string };
};

const mockCount = jest.fn<Promise<number>, [CountQuery]>();
const mockFindMany = jest.fn<Promise<{ id: string }[]>, [unknown]>();
const mockUpdateMany = jest.fn<Promise<{ count: number }>, [UpdateQuery]>();
const mockPartnerFindMany = jest.fn<Promise<{ id: string; name: string }[]>, [unknown]>();

jest.mock('@/lib/database/prisma', () => ({
	prisma: {
		recipient: {
			count: mockCount,
		},
		localPartner: {
			findMany: mockPartnerFindMany,
		},
		$transaction: (callback: (transaction: unknown) => Promise<unknown>) =>
			callback({
				recipient: {
					findMany: mockFindMany,
					updateMany: mockUpdateMany,
				},
			}),
	},
}));

import { countCandidates, updateUnassignedCandidateAssignments } from './candidate.repository';
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

describe('updateUnassignedCandidateAssignments', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('returns a failure without updating when fewer candidates match than requested', async () => {
		mockFindMany.mockResolvedValue([{ id: 'candidate-1' }]);

		await expect(updateUnassignedCandidateAssignments(countryFilter, 'program-1', 2)).resolves.toEqual({
			outcome: 'insufficient',
		});
		expect(mockUpdateMany).not.toHaveBeenCalled();
	});

	test('does not keep an assignment when a concurrent request already claimed a selected candidate', async () => {
		mockFindMany.mockResolvedValue([{ id: 'candidate-1' }, { id: 'candidate-2' }]);
		mockUpdateMany.mockResolvedValue({ count: 1 });

		await expect(updateUnassignedCandidateAssignments(countryFilter, 'program-1', 2)).resolves.toEqual({
			outcome: 'insufficient',
		});
		const update = mockUpdateMany.mock.calls[0]?.[0];
		expect(update?.where.id.in).toHaveLength(2);
		expect(update?.where.id.in).toEqual(expect.arrayContaining(['candidate-1', 'candidate-2']));
		expect(update?.where.programId).toBeNull();
		expect(update?.data).toEqual({ programId: 'program-1' });
	});

	test('returns the number of candidates whose program was set while leaving startDate unset', async () => {
		mockFindMany.mockResolvedValue([{ id: 'candidate-1' }]);
		mockUpdateMany.mockResolvedValue({ count: 1 });

		await expect(updateUnassignedCandidateAssignments(countryFilter, 'program-1', 1)).resolves.toEqual({
			outcome: 'assigned',
			assigned: 1,
		});
		expect(mockUpdateMany).toHaveBeenCalledWith({
			where: { id: { in: ['candidate-1'] }, programId: null },
			data: { programId: 'program-1' },
		});
	});
});

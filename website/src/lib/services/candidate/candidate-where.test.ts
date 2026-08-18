import { CountryCode } from '@/generated/prisma/client';
import { buildCandidateWhere } from './candidate-where';
import { Profile } from './candidate.types';

jest.mock('@/generated/prisma/client', () => ({
	CountryCode: { SL: 'SL' },
	Prisma: {},
}));
jest.mock('@/generated/prisma/enums', () => ({
	Profile: { male: 'male', female: 'female', youth: 'youth' },
}));
jest.mock('@/lib/utils/now', () => ({
	now: () => new Date('2026-08-17T12:00:00.000Z'),
}));

const youthCutoffDate = new Date(2026 - 25, 7, 17);

describe('buildCandidateWhere', () => {
	it('returns unassigned recipients when no filters are set', () => {
		expect(buildCandidateWhere()).toEqual({ programId: null });
	});

	it('requires every selected focus instead of any of them', () => {
		expect(buildCandidateWhere(['poverty', 'health'])).toEqual({
			programId: null,
			AND: [
				{ localPartner: { focuses: { some: { focusId: 'poverty' } } } },
				{ localPartner: { focuses: { some: { focusId: 'health' } } } },
			],
		});
	});

	it('requires female and youth together instead of either', () => {
		expect(buildCandidateWhere([], [Profile.female, Profile.youth])).toEqual({
			programId: null,
			AND: [
				{
					contact: {
						AND: [{ gender: Profile.female }, { dateOfBirth: { gte: youthCutoffDate } }],
					},
				},
			],
		});
	});

	it('requires male and female together so nobody matches both', () => {
		expect(buildCandidateWhere([], [Profile.male, Profile.female])).toEqual({
			programId: null,
			AND: [
				{
					contact: {
						AND: [{ gender: Profile.male }, { gender: Profile.female }],
					},
				},
			],
		});
	});

	it('keeps country matching alongside AND filters', () => {
		expect(buildCandidateWhere(['poverty'], [Profile.female], CountryCode.SL)).toEqual({
			programId: null,
			AND: [
				{
					OR: [
						{ contact: { address: { country: CountryCode.SL } } },
						{
							AND: [
								{
									OR: [{ contact: { address: null } }, { contact: { address: { country: null } } }],
								},
								{ localPartner: { contact: { address: { country: CountryCode.SL } } } },
							],
						},
					],
				},
				{ localPartner: { focuses: { some: { focusId: 'poverty' } } } },
				{ contact: { AND: [{ gender: Profile.female }] } },
			],
		});
	});
});

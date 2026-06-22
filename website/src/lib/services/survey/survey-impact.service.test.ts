import { CountryCode, Gender, type PrismaClient, SurveyQuestionnaire } from '@/generated/prisma/client';
import { SurveyImpactService } from './survey-impact.service';

jest.mock('@/generated/prisma/client', () => ({
	CountryCode: { KE: 'KE', UG: 'UG' },
	Gender: { female: 'female', male: 'male' },
	PrismaClient: class {},
	SurveyQuestionnaire: { checkin: 'checkin', onboarding: 'onboarding' },
	SurveyStatus: { completed: 'completed' },
}));

type MockSurveyDelegate = {
	findMany: jest.Mock;
};

const createService = (surveys: unknown[]) => {
	const findMany = jest.fn<Promise<unknown[]>, [unknown]>().mockResolvedValue(surveys);
	const db = {
		survey: {
			findMany,
		} satisfies MockSurveyDelegate,
	};
	const service = new SurveyImpactService(db as unknown as PrismaClient);

	return { service, findMany };
};

describe('SurveyImpactService focus filters', () => {
	test('loads deduplicated focus filter options from completed survey recipients local partners', async () => {
		const { service, findMany } = createService([
			{
				questionnaire: SurveyQuestionnaire.checkin,
				recipient: {
					localPartner: {
						focuses: [
							{ focus: { id: 'focus-health', slug: 'health' } },
							{ focus: { id: 'focus-education', slug: 'education' } },
						],
					},
					program: {
						id: 'program-beta',
						name: 'Beta Program',
						country: { isoCode: CountryCode.UG },
					},
				},
			},
			{
				questionnaire: SurveyQuestionnaire.onboarding,
				recipient: {
					localPartner: {
						focuses: [{ focus: { id: 'focus-health', slug: 'health' } }],
					},
					program: {
						id: 'program-alpha',
						name: 'Alpha Program',
						country: { isoCode: CountryCode.KE },
					},
				},
			},
		]);

		const result = await service.getImpactFilterOptions();

		expect(result.success).toBe(true);
		if (!result.success) {
			throw new Error(result.error);
		}
		expect(findMany).toHaveBeenCalledWith({
			where: { status: 'completed' },
			select: {
				questionnaire: true,
				recipient: {
					select: {
						localPartner: {
							select: {
								focuses: {
									select: {
										focus: {
											select: {
												id: true,
												slug: true,
											},
										},
									},
								},
							},
						},
						program: {
							select: {
								id: true,
								name: true,
								country: {
									select: {
										isoCode: true,
									},
								},
							},
						},
					},
				},
			},
		});
		expect(result.data.focuses).toEqual([
			{ value: 'focus-education', label: 'education' },
			{ value: 'focus-health', label: 'health' },
		]);
	});

	test('filters impact measurements through recipients local partner focuses', async () => {
		const { service, findMany } = createService([]);

		await service.getImpactMeasurements({
			focusIds: ['focus-health', 'focus-education'],
			recipientGenders: [Gender.female],
		});

		expect(findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: {
					status: 'completed',
					recipient: {
						localPartner: {
							focuses: {
								some: {
									focusId: {
										in: ['focus-health', 'focus-education'],
									},
								},
							},
						},
						contact: {
							gender: {
								in: [Gender.female],
							},
						},
					},
				},
			}),
		);
	});
});

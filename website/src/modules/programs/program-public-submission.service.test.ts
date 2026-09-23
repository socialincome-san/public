import { CountryCode } from '@/generated/prisma/enums';
import { resultOk } from '@/lib/service-result';

const mockFetchStoryblokPrograms = jest.fn();
const mockFindEligiblePrograms = jest.fn();
const mockFindEligibleProgram = jest.fn();

jest.mock('@/integrations/storyblok/storyblok-program.integration', () => ({
	fetchStoryblokPrograms: mockFetchStoryblokPrograms,
}));
jest.mock('./program.repository', () => ({
	findEligiblePublicSubmissionPrograms: mockFindEligiblePrograms,
	findEligiblePublicSubmissionProgram: mockFindEligibleProgram,
}));

import {
	getEligibleProgramsForPublicSubmission,
	isProgramEligibleForPublicSubmission,
} from './program-public-submission.service';

describe('program public submission service', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('enriches eligible database programs with localized Storyblok content', async () => {
		mockFetchStoryblokPrograms
			.mockResolvedValueOnce(
				resultOk([
					{
						content: {
							portalSlug: 'program',
							title: 'Program',
							description: 'Description',
							primaryImage: { filename: 'https://a.storyblok.com/image.jpg' },
						},
					},
				]),
			)
			.mockResolvedValueOnce(
				resultOk([
					{
						content: {
							portalSlug: 'program',
							title: 'Programm',
							description: 'Beschreibung',
							primaryImage: { filename: 'https://a.storyblok.com/image.jpg' },
						},
					},
				]),
			);
		mockFindEligiblePrograms.mockResolvedValue([
			{
				id: 'program-1',
				name: 'Program',
				slug: 'program',
				countryId: 'country-1',
				country: { isoCode: CountryCode.SL },
				targetFocuses: [{ focus: { name: 'Health' } }],
				_count: { recipients: 3 },
			},
		]);

		const result = await getEligibleProgramsForPublicSubmission('de');

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data[0]).toMatchObject({
				id: 'program-1',
				name: 'Programm',
				description: 'Beschreibung',
				recipientsCount: 3,
				tags: ['Health'],
			});
		}
	});

	it('requires a published Storyblok slug and recipients for eligibility', async () => {
		mockFetchStoryblokPrograms.mockResolvedValue(resultOk([{ content: { portalSlug: 'program', title: 'Program' } }]));
		mockFindEligibleProgram.mockResolvedValue({ id: 'program-1' });

		await expect(isProgramEligibleForPublicSubmission(' program-1 ')).resolves.toEqual(resultOk(true));
		expect(mockFindEligibleProgram).toHaveBeenCalledWith('program-1', ['program']);
	});
});

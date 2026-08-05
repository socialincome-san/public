import type { ServiceResult } from '@/lib/services/core/base.types';
import type { PublicSubmissionProgramOption } from '@/lib/services/program/program-public-submission.service';

const mockGetPrograms = jest.fn();
const mockGetFocuses = jest.fn();
const mockGetEligibleProgramOptions = jest.fn();
const mockGetProgramPortalSlug = jest.fn((content: { portalSlug: string }) => content.portalSlug.trim());
const mockGetProgramTitle = jest.fn((content: { title: string; portalSlug: string }) => content.title.trim() || content.portalSlug);
const mockGetFocusTitleBySlug = jest.fn(() => new Map([['poverty', 'Poverty alleviation']]));
const mockFormatStoryblokUrl = jest.fn((filename: string) => `https://img.test/${filename}`);

jest.mock('@/lib/services/services', () => ({
	services: {
		storyblok: {
			getPrograms: mockGetPrograms,
			getFocuses: mockGetFocuses,
		},
		programPublicSubmission: {
			getEligibleProgramOptions: mockGetEligibleProgramOptions,
		},
	},
}));

jest.mock('@/components/storyblok/program/program.utils', () => ({
	getProgramPortalSlug: (content: { portalSlug: string }) => mockGetProgramPortalSlug(content),
	getProgramTitle: (content: { title: string; portalSlug: string }) => mockGetProgramTitle(content),
}));

jest.mock('@/components/storyblok/program/programs-overview.server', () => ({
	getFocusTitleBySlug: () => mockGetFocusTitleBySlug(),
}));

jest.mock('@/lib/services/storyblok/storyblok.utils', () => ({
	formatStoryblokUrl: (...args: unknown[]) => mockFormatStoryblokUrl(...(args as [string])),
}));

import { getEligiblePublicSubmissionProgramsAction } from '@/lib/server-actions/campaign-public-actions';

type StoryblokProgram = {
	content: {
		portalSlug: string;
		title: string;
		description?: string;
		primaryImage?: { filename: string; focus?: string };
	};
};

const enProgram = (portalSlug: string, title: string): StoryblokProgram => ({
	content: {
		portalSlug,
		title,
		description: `${title} EN description`,
		primaryImage: { filename: `${portalSlug}.jpg`, focus: '0x0:1x1' },
	},
});

const deProgram = (portalSlug: string, title: string): StoryblokProgram => ({
	content: {
		portalSlug,
		title,
		description: `${title} DE description`,
		primaryImage: { filename: `${portalSlug}-de.jpg`, focus: '0x0:1x1' },
	},
});

const eligibleRow = {
	id: 'program-1',
	name: 'DB Name',
	slug: 'si-core-sl',
	countryId: 'country-sl',
	countryIsoCode: 'SL' as const,
	recipientsCount: 8,
	focuses: [{ slug: 'poverty', name: 'Poverty' }],
};

describe('getEligiblePublicSubmissionProgramsAction', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockGetFocuses.mockResolvedValue({ success: true, data: [] });
		mockGetEligibleProgramOptions.mockResolvedValue({ success: true, data: [eligibleRow] });
	});

	test('uses default-language Storyblok slugs for eligibility even when enriching another locale', async () => {
		mockGetPrograms.mockImplementation(async (lang: string) => {
			if (lang === 'en') {
				return { success: true, data: [enProgram('si-core-sl', 'Core EN'), enProgram('only-en', 'Only EN')] };
			}

			return { success: true, data: [deProgram('si-core-sl', 'Core DE'), deProgram('only-de', 'Only DE')] };
		});

		const result = await getEligiblePublicSubmissionProgramsAction('de');

		expect(mockGetPrograms).toHaveBeenCalledWith('en');
		expect(mockGetPrograms).toHaveBeenCalledWith('de');
		expect(mockGetEligibleProgramOptions).toHaveBeenCalledWith(['si-core-sl', 'only-en']);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data[0]).toMatchObject({
				id: 'program-1',
				name: 'Core DE',
				description: 'Core DE DE description',
				imageUrl: 'https://img.test/si-core-sl-de.jpg',
				tags: ['Poverty alleviation'],
			} satisfies Partial<PublicSubmissionProgramOption>);
		}
	});

	test('falls back to DB name and null media when Storyblok enrichment is missing', async () => {
		mockGetPrograms.mockResolvedValue({
			success: true,
			data: [enProgram('other-program', 'Other')],
		});
		mockGetEligibleProgramOptions.mockResolvedValue({
			success: true,
			data: [{ ...eligibleRow, slug: 'missing-in-storyblok' }],
		});

		const result = await getEligiblePublicSubmissionProgramsAction('en');

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data[0]).toMatchObject({
				name: 'DB Name',
				description: null,
				imageUrl: null,
				tags: ['Poverty alleviation'],
			});
		}
	});

	test('treats invalid language input as the default language', async () => {
		mockGetPrograms.mockResolvedValue({ success: true, data: [enProgram('si-core-sl', 'Core EN')] });

		await getEligiblePublicSubmissionProgramsAction('nope' as never);

		expect(mockGetPrograms).toHaveBeenCalledTimes(1);
		expect(mockGetPrograms).toHaveBeenCalledWith('en');
		expect(mockGetFocuses).toHaveBeenCalledWith('en');
	});

	test('propagates eligibility service failures', async () => {
		mockGetPrograms.mockResolvedValue({ success: true, data: [enProgram('si-core-sl', 'Core EN')] });
		const failure: ServiceResult<never> = { success: false, error: 'Could not load programs.', status: 503 };
		mockGetEligibleProgramOptions.mockResolvedValue(failure);

		const result = await getEligiblePublicSubmissionProgramsAction('en');

		expect(result).toEqual(failure);
	});

	test('propagates Storyblok eligibility failures instead of returning an empty list', async () => {
		const failure: ServiceResult<never> = {
			success: false,
			error: 'Failed to fetch programs: {"message":"down"}',
		};
		mockGetPrograms.mockResolvedValue(failure);

		const result = await getEligiblePublicSubmissionProgramsAction('en');

		expect(result).toEqual(failure);
		expect(mockGetEligibleProgramOptions).not.toHaveBeenCalled();
	});
});

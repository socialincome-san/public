import { type PrismaClient } from '@/generated/prisma/client';
import type { ServiceResult } from '../core/base.types';
import type { StoryblokService } from '../storyblok/storyblok.service';
import { ProgramPublicSubmissionService, type PublicSubmissionProgramOption } from './program-public-submission.service';

jest.mock('@/generated/prisma/client', () => ({
	Prisma: {},
	PrismaClient: class {},
}));

const mockFormatStoryblokUrl = jest.fn((filename: string) => `https://img.test/${filename}`);

jest.mock('../storyblok/storyblok.utils', () => ({
	formatStoryblokUrl: (...args: unknown[]) => mockFormatStoryblokUrl(...(args as [string])),
}));

const expectSuccess = <T>(result: ServiceResult<T>) => {
	expect(result.success).toBe(true);
	if (!result.success) {
		throw new Error(result.error);
	}

	return result.data;
};

const expectFailure = (result: ServiceResult<unknown>, error: string) => {
	expect(result.success).toBe(false);
	if (result.success) {
		throw new Error('Expected failure');
	}
	expect(result.error).toBe(error);
};

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
	tags: ['Poverty'],
};

const createService = () => {
	const findMany = jest.fn();
	const findFirst = jest.fn();
	const getPrograms = jest.fn();
	const db = {
		program: {
			findMany,
			findFirst,
		},
	};
	const storyblok = {
		getPrograms,
	} as unknown as StoryblokService;
	const logger = { error: jest.fn() };
	const service = new ProgramPublicSubmissionService(db as unknown as PrismaClient, storyblok, logger as never);

	return { service, findMany, findFirst, getPrograms, logger };
};

describe('ProgramPublicSubmissionService', () => {
	describe('getEligibleProgramsForPublicSubmission', () => {
		beforeEach(() => {
			jest.clearAllMocks();
		});

		test('uses default-language Storyblok slugs for eligibility even when enriching another locale', async () => {
			const { service, findMany, getPrograms } = createService();
			getPrograms.mockImplementation((lang: string) => {
				if (lang === 'en') {
					return Promise.resolve({
						success: true,
						data: [enProgram('si-core-sl', 'Core EN'), enProgram('only-en', 'Only EN')],
					});
				}

				return Promise.resolve({
					success: true,
					data: [deProgram('si-core-sl', 'Core DE'), deProgram('only-de', 'Only DE')],
				});
			});
			findMany.mockResolvedValue([
				{
					id: 'program-1',
					name: 'DB Name',
					slug: 'si-core-sl',
					countryId: 'country-sl',
					country: { isoCode: 'SL' },
					targetFocuses: [{ focus: { name: 'Poverty' } }],
					_count: { recipients: 8 },
				},
			]);

			const data = expectSuccess(await service.getEligibleProgramsForPublicSubmission('de'));

			expect(getPrograms).toHaveBeenCalledWith('en');
			expect(getPrograms).toHaveBeenCalledWith('de');
			expect(getPrograms).toHaveBeenCalledTimes(2);
			expect(findMany).toHaveBeenCalledWith(
				expect.objectContaining({
					where: {
						slug: { in: ['si-core-sl', 'only-en'] },
						recipients: { some: {} },
					},
				}),
			);
			expect(data[0]).toMatchObject({
				id: 'program-1',
				name: 'Core DE',
				description: 'Core DE DE description',
				imageUrl: 'https://img.test/si-core-sl-de.jpg',
				tags: ['Poverty'],
			} satisfies Partial<PublicSubmissionProgramOption>);
		});

		test('falls back to DB name and null media when Storyblok enrichment is missing', async () => {
			const { service, findMany, getPrograms } = createService();
			getPrograms.mockResolvedValue({
				success: true,
				data: [enProgram('other-program', 'Other')],
			});
			findMany.mockResolvedValue([
				{
					...eligibleRow,
					slug: 'missing-in-storyblok',
					country: { isoCode: 'SL' },
					targetFocuses: [{ focus: { name: 'Poverty' } }],
					_count: { recipients: 8 },
				},
			]);

			const data = expectSuccess(await service.getEligibleProgramsForPublicSubmission('en'));

			expect(data[0]).toMatchObject({
				name: 'DB Name',
				description: null,
				imageUrl: null,
				tags: ['Poverty'],
			});
		});

		test('propagates eligibility service failures', async () => {
			const { service, findMany, getPrograms, logger } = createService();
			getPrograms.mockResolvedValue({ success: true, data: [enProgram('si-core-sl', 'Core EN')] });
			findMany.mockRejectedValue(new Error('db down'));

			const result = await service.getEligibleProgramsForPublicSubmission('en');

			expectFailure(result, 'Could not load programs.');
			expect(logger.error).toHaveBeenCalled();
		});

		test('propagates Storyblok eligibility failures instead of returning an empty list', async () => {
			const { service, findMany, getPrograms } = createService();
			const failure: ServiceResult<never> = {
				success: false,
				error: 'Failed to fetch programs: {"message":"down"}',
			};
			getPrograms.mockResolvedValue(failure);

			const result = await service.getEligibleProgramsForPublicSubmission('en');

			expect(result).toEqual(failure);
			expect(findMany).not.toHaveBeenCalled();
		});
	});

	describe('getEligibleProgramOptions', () => {
		test('maps country, recipient count, and focus names as tags for matching published slugs', async () => {
			const { service, findMany } = createService();
			findMany.mockResolvedValue([
				{
					id: 'program-1',
					name: 'Core SL',
					slug: 'si-core-sl',
					countryId: 'country-sl',
					country: { isoCode: 'SL' },
					targetFocuses: [{ focus: { name: 'Poverty' } }, { focus: { name: 'Health' } }],
					_count: { recipients: 12 },
				},
			]);

			const data = expectSuccess(await service.getEligibleProgramOptions([' si-core-sl ', 'si-core-sl', '']));

			expect(findMany).toHaveBeenCalledWith(
				expect.objectContaining({
					where: {
						slug: { in: ['si-core-sl'] },
						recipients: { some: {} },
					},
				}),
			);
			expect(data).toEqual([
				{
					id: 'program-1',
					name: 'Core SL',
					slug: 'si-core-sl',
					countryId: 'country-sl',
					countryIsoCode: 'SL',
					recipientsCount: 12,
					tags: ['Poverty', 'Health'],
				},
			]);
		});

		test('short-circuits to an empty list when no published slugs remain', async () => {
			const { service, findMany } = createService();

			const data = expectSuccess(await service.getEligibleProgramOptions(['  ', '']));

			expect(data).toEqual([]);
			expect(findMany).not.toHaveBeenCalled();
		});

		test('returns a failure result when Prisma throws', async () => {
			const { service, findMany, logger } = createService();
			findMany.mockRejectedValue(new Error('db down'));

			const result = await service.getEligibleProgramOptions(['si-core-sl']);

			expectFailure(result, 'Could not load programs.');
			expect(logger.error).toHaveBeenCalled();
		});
	});

	describe('isProgramEligible', () => {
		test('returns false for blank program ids without querying', async () => {
			const { service, findFirst } = createService();

			const data = expectSuccess(await service.isProgramEligible('   ', ['si-core-sl']));

			expect(data).toBe(false);
			expect(findFirst).not.toHaveBeenCalled();
		});

		test('returns false when no published slugs remain', async () => {
			const { service, findFirst } = createService();

			const data = expectSuccess(await service.isProgramEligible('program-1', ['']));

			expect(data).toBe(false);
			expect(findFirst).not.toHaveBeenCalled();
		});

		test('returns true when an eligible program exists', async () => {
			const { service, findFirst } = createService();
			findFirst.mockResolvedValue({ id: 'program-1' });

			const data = expectSuccess(await service.isProgramEligible(' program-1 ', ['si-core-sl']));

			expect(data).toBe(true);
			expect(findFirst).toHaveBeenCalledWith(
				expect.objectContaining({
					where: {
						id: 'program-1',
						slug: { in: ['si-core-sl'] },
						recipients: { some: {} },
					},
				}),
			);
		});
	});
});

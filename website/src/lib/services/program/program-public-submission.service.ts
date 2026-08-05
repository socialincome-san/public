import { type CountryCode, PrismaClient } from '@/generated/prisma/client';
import type { Program } from '@/generated/storyblok/types/109655/storyblok-components';
import { defaultLanguage, type WebsiteLanguage } from '@/lib/i18n/utils';
import { logger } from '@/lib/utils/logger';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import type { StoryblokService } from '../storyblok/storyblok.service';
import { formatStoryblokUrl } from '../storyblok/storyblok.utils';

const PROGRAM_DETAILS_IMAGE_WIDTH = 248;
const PROGRAM_DETAILS_IMAGE_HEIGHT = 140;

export type PublicSubmissionProgramOption = {
	id: string;
	name: string;
	slug: string;
	countryId: string;
	countryIsoCode: CountryCode;
	recipientsCount: number;
	description: string | null;
	imageUrl: string | null;
	tags: string[];
};

type EligibleProgramRow = Omit<PublicSubmissionProgramOption, 'description' | 'imageUrl'>;

const getProgramPortalSlug = (program: Program) => program.portalSlug.trim();

const getProgramTitle = (program: Program) => program.title.trim() || getProgramPortalSlug(program);

export class ProgramPublicSubmissionService extends BaseService {
	constructor(
		db: PrismaClient,
		private readonly storyblok: StoryblokService,
		loggerInstance = logger,
	) {
		super(db, loggerInstance);
	}

	async getEligibleProgramsForPublicSubmission(
		lang: WebsiteLanguage = defaultLanguage,
	): Promise<ServiceResult<PublicSubmissionProgramOption[]>> {
		const needsLocalizedEnrichment = lang !== defaultLanguage;

		const [eligibilityProgramsResult, enrichmentProgramsResult] = await Promise.all([
			this.storyblok.getPrograms(defaultLanguage),
			needsLocalizedEnrichment ? this.storyblok.getPrograms(lang) : Promise.resolve(null),
		]);

		if (!eligibilityProgramsResult.success) {
			return eligibilityProgramsResult;
		}

		const eligibilityPrograms = eligibilityProgramsResult.data;
		const enrichmentPrograms =
			needsLocalizedEnrichment && enrichmentProgramsResult?.success ? enrichmentProgramsResult.data : eligibilityPrograms;
		const publishedPortalSlugs = [
			...new Set(eligibilityPrograms.map((program) => getProgramPortalSlug(program.content)).filter(Boolean)),
		];
		const storyblokByPortalSlug = new Map(
			enrichmentPrograms.flatMap((program) => {
				const portalSlug = getProgramPortalSlug(program.content);
				if (!portalSlug) {
					return [];
				}

				return [[portalSlug, program] as const];
			}),
		);

		const eligibleResult = await this.getEligibleProgramOptions(publishedPortalSlugs);
		if (!eligibleResult.success) {
			return eligibleResult;
		}

		return this.resultOk(
			eligibleResult.data.map((program): PublicSubmissionProgramOption => {
				const storyblokProgram = storyblokByPortalSlug.get(program.slug);
				const name = storyblokProgram ? getProgramTitle(storyblokProgram.content) : program.name;
				const trimmedDescription = storyblokProgram?.content.description?.trim();
				const description = trimmedDescription !== undefined && trimmedDescription.length > 0 ? trimmedDescription : null;
				const primaryImage = storyblokProgram?.content.primaryImage;
				const imageUrl = primaryImage?.filename
					? formatStoryblokUrl(
							primaryImage.filename,
							PROGRAM_DETAILS_IMAGE_WIDTH,
							PROGRAM_DETAILS_IMAGE_HEIGHT,
							primaryImage.focus,
						)
					: null;

				return {
					id: program.id,
					name,
					slug: program.slug,
					countryId: program.countryId,
					countryIsoCode: program.countryIsoCode,
					recipientsCount: program.recipientsCount,
					description,
					imageUrl,
					tags: program.tags,
				};
			}),
		);
	}

	async getEligibleProgramOptions(publishedPortalSlugs: string[]): Promise<ServiceResult<EligibleProgramRow[]>> {
		try {
			const normalizedSlugs = [...new Set(publishedPortalSlugs.map((slug) => slug.trim()).filter(Boolean))];
			if (!normalizedSlugs.length) {
				return this.resultOk([]);
			}

			const programs = await this.db.program.findMany({
				where: {
					slug: { in: normalizedSlugs },
					recipients: { some: {} },
				},
				select: {
					id: true,
					name: true,
					slug: true,
					countryId: true,
					country: {
						select: {
							isoCode: true,
						},
					},
					targetFocuses: {
						select: {
							focus: {
								select: {
									name: true,
								},
							},
						},
					},
					_count: {
						select: {
							recipients: true,
						},
					},
				},
				orderBy: { name: 'asc' },
			});

			return this.resultOk(
				programs.map(({ id, name, slug, countryId, country, targetFocuses, _count }) => ({
					id,
					name,
					slug,
					countryId,
					countryIsoCode: country.isoCode,
					recipientsCount: _count.recipients,
					tags: targetFocuses.map(({ focus }) => focus.name),
				})),
			);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail('Could not load programs.');
		}
	}

	async isProgramEligible(programId: string, publishedPortalSlugs: string[]): Promise<ServiceResult<boolean>> {
		try {
			const normalizedProgramId = programId.trim();
			if (!normalizedProgramId) {
				return this.resultOk(false);
			}

			const normalizedSlugs = new Set(publishedPortalSlugs.map((slug) => slug.trim()).filter(Boolean));
			if (!normalizedSlugs.size) {
				return this.resultOk(false);
			}

			const program = await this.db.program.findFirst({
				where: {
					id: normalizedProgramId,
					slug: { in: [...normalizedSlugs] },
					recipients: { some: {} },
				},
				select: { id: true },
			});

			return this.resultOk(Boolean(program));
		} catch (error) {
			this.logger.error(error);

			return this.resultFail('Could not verify program eligibility.');
		}
	}
}

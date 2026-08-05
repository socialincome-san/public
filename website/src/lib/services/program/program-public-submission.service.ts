import { type CountryCode, PrismaClient } from '@/generated/prisma/client';
import { logger } from '@/lib/utils/logger';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';

export type PublicSubmissionProgramFocus = {
	slug: string;
	name: string;
};

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

type EligibleProgramRow = Omit<PublicSubmissionProgramOption, 'description' | 'imageUrl' | 'tags'> & {
	focuses: PublicSubmissionProgramFocus[];
};

export class ProgramPublicSubmissionService extends BaseService {
	constructor(db: PrismaClient, loggerInstance = logger) {
		super(db, loggerInstance);
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
									slug: true,
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
					focuses: targetFocuses.map(({ focus }) => ({
						slug: focus.slug,
						name: focus.name,
					})),
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

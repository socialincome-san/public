import { PrismaClient } from '@/generated/prisma/client';
import { logger } from '@/lib/utils/logger';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';

export type PublicSubmissionProgramOption = {
	id: string;
	name: string;
};

export class ProgramPublicSubmissionService extends BaseService {
	constructor(db: PrismaClient, loggerInstance = logger) {
		super(db, loggerInstance);
	}

	async getEligibleProgramOptions(publishedPortalSlugs: string[]): Promise<ServiceResult<PublicSubmissionProgramOption[]>> {
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
				},
				orderBy: { name: 'asc' },
			});

			return this.resultOk(programs);
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

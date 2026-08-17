import { PrismaClient } from '@/generated/prisma/client';
import { logger } from '@/lib/utils/logger';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';

export class CampaignValidationService extends BaseService {
	constructor(db: PrismaClient, loggerInstance = logger) {
		super(db, loggerInstance);
	}

	async validateSlugUniqueness(slug: string): Promise<ServiceResult<void>> {
		const normalizedSlug = slug.trim();
		if (!normalizedSlug) {
			return this.resultFail('Slug is required.');
		}

		const slugConflict = await this.db.campaign.findFirst({
			where: { slug: normalizedSlug },
			select: { id: true },
		});
		if (slugConflict) {
			return this.resultFail('A campaign with this slug already exists.');
		}

		return this.resultOk(undefined);
	}
}

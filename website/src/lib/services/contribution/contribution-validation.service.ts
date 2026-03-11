import { PrismaClient } from '@/generated/prisma/client';
import { logger } from '@/lib/utils/logger';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import {
	ContributionFormCreateInput,
	ContributionFormUpdateInput,
	contributionCreateInputSchema,
	contributionUpdateInputSchema,
} from './contribution-form-input';

export class ContributionValidationService extends BaseService {
	constructor(db: PrismaClient, loggerInstance = logger) {
		super(db, loggerInstance);
	}

	validateCreateInput(input: ContributionFormCreateInput): ServiceResult<ContributionFormCreateInput> {
		const parsed = contributionCreateInputSchema.safeParse(input);
		if (!parsed.success) {
			return this.resultFail(parsed.error.issues[0]?.message ?? 'Invalid input.');
		}
		return this.resultOk(parsed.data);
	}

	validateUpdateInput(input: ContributionFormUpdateInput): ServiceResult<ContributionFormUpdateInput> {
		const parsed = contributionUpdateInputSchema.safeParse(input);
		if (!parsed.success) {
			return this.resultFail(parsed.error.issues[0]?.message ?? 'Invalid input.');
		}
		return this.resultOk(parsed.data);
	}

	async validateReferencesExist(input: {
		contributorId: string;
		campaignId: string;
	}): Promise<ServiceResult<void>> {
		const [contributor, campaign] = await Promise.all([
			this.db.contributor.findUnique({
				where: { id: input.contributorId },
				select: { id: true },
			}),
			this.db.campaign.findUnique({
				where: { id: input.campaignId },
				select: { id: true },
			}),
		]);

		if (!contributor) {
			return this.resultFail('Contributor not found.');
		}
		if (!campaign) {
			return this.resultFail('Campaign not found.');
		}
		return this.resultOk(undefined);
	}
}

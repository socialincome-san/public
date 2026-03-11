import { PrismaClient } from '@/generated/prisma/client';
import { logger } from '@/lib/utils/logger';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import {
	CampaignFormCreateInput,
	CampaignFormUpdateInput,
	campaignCreateInputSchema,
	campaignUpdateInputSchema,
} from './campaign-form-input';

type CampaignUpdateUniquenessContext = {
	campaignId: string;
	existingTitle: string;
};

export class CampaignValidationService extends BaseService {
	constructor(db: PrismaClient, loggerInstance = logger) {
		super(db, loggerInstance);
	}

	validateCreateInput(input: CampaignFormCreateInput): ServiceResult<CampaignFormCreateInput> {
		const parsedInput = campaignCreateInputSchema.safeParse(input);
		if (!parsedInput.success) {
			return this.resultFail(parsedInput.error.issues[0]?.message ?? 'Invalid input.');
		}

		return this.resultOk(parsedInput.data);
	}

	validateUpdateInput(input: CampaignFormUpdateInput): ServiceResult<CampaignFormUpdateInput> {
		const parsedInput = campaignUpdateInputSchema.safeParse(input);
		if (!parsedInput.success) {
			return this.resultFail(parsedInput.error.issues[0]?.message ?? 'Invalid input.');
		}

		return this.resultOk(parsedInput.data);
	}

	async validateCreateUniqueness(input: CampaignFormCreateInput): Promise<ServiceResult<void>> {
		const titleConflict = await this.db.campaign.findUnique({
			where: { title: input.title },
			select: { id: true },
		});
		if (titleConflict) {
			return this.resultFail('A campaign with this title already exists.');
		}

		return this.resultOk(undefined);
	}

	async validateUpdateUniqueness(
		input: CampaignFormUpdateInput,
		context: CampaignUpdateUniquenessContext,
	): Promise<ServiceResult<void>> {
		if (input.title !== context.existingTitle) {
			const titleConflict = await this.db.campaign.findUnique({
				where: { title: input.title },
				select: { id: true },
			});
			if (titleConflict && titleConflict.id !== context.campaignId) {
				return this.resultFail('A campaign with this title already exists.');
			}
		}

		return this.resultOk(undefined);
	}
}

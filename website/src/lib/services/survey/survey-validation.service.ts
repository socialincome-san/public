import { PrismaClient } from '@/generated/prisma/client';
import { logger } from '@/lib/utils/logger';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import {
	SurveyFormCreateInput,
	SurveyFormUpdateInput,
	surveyCreateInputSchema,
	surveyUpdateInputSchema,
} from './survey-form-input';
import { SurveyUpdateUniquenessContext } from './survey-validation.types';

export class SurveyValidationService extends BaseService {
	constructor(db: PrismaClient, loggerInstance = logger) {
		super(db, loggerInstance);
	}

	validateCreateInput(input: SurveyFormCreateInput): ServiceResult<SurveyFormCreateInput> {
		const parsed = surveyCreateInputSchema.safeParse(input);
		if (!parsed.success) {
			return this.resultFail(parsed.error.issues[0]?.message ?? 'Invalid input.');
		}

		return this.resultOk(parsed.data);
	}

	validateUpdateInput(input: SurveyFormUpdateInput): ServiceResult<SurveyFormUpdateInput> {
		const parsed = surveyUpdateInputSchema.safeParse(input);
		if (!parsed.success) {
			return this.resultFail(parsed.error.issues[0]?.message ?? 'Invalid input.');
		}

		return this.resultOk(parsed.data);
	}

	async validateCreateUniqueness(input: SurveyFormCreateInput): Promise<ServiceResult<void>> {
		const accessEmailConflict = await this.db.survey.findUnique({
			where: { accessEmail: input.accessEmail },
			select: { id: true },
		});
		if (accessEmailConflict) {
			return this.resultFail('A survey with this access email already exists.');
		}

		const nameConflict = await this.db.survey.findUnique({
			where: {
				recipientId_name: {
					recipientId: input.recipientId,
					name: input.name,
				},
			},
			select: { id: true },
		});
		if (nameConflict) {
			return this.resultFail('A survey with this name already exists for the selected recipient.');
		}

		return this.resultOk(undefined);
	}

	async validateUpdateUniqueness(
		input: SurveyFormUpdateInput,
		context: SurveyUpdateUniquenessContext,
	): Promise<ServiceResult<void>> {
		if (input.accessEmail !== context.existingAccessEmail) {
			const accessEmailConflict = await this.db.survey.findUnique({
				where: { accessEmail: input.accessEmail },
				select: { id: true },
			});
			if (accessEmailConflict && accessEmailConflict.id !== input.id) {
				return this.resultFail('A survey with this access email already exists.');
			}
		}

		const targetRecipientId = input.recipientId;
		const targetName = input.name;
		if (targetRecipientId !== context.existingRecipientId || targetName !== context.existingName) {
			const nameConflict = await this.db.survey.findUnique({
				where: {
					recipientId_name: {
						recipientId: targetRecipientId,
						name: targetName,
					},
				},
				select: { id: true },
			});
			if (nameConflict && nameConflict.id !== input.id) {
				return this.resultFail('A survey with this name already exists for the selected recipient.');
			}
		}

		return this.resultOk(undefined);
	}
}

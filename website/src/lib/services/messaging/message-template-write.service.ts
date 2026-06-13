import { MessageTemplate, PrismaClient } from '@/generated/prisma/client';
import { logger } from '@/lib/utils/logger';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { MessageTemplateCreateInput, MessageTemplateUpdateInput } from './message-template-form-input';
import { MessageTemplateValidationService } from './message-template-validation.service';

export class MessageTemplateWriteService extends BaseService {
	constructor(
		db: PrismaClient,
		private readonly validationService: MessageTemplateValidationService,
		loggerInstance = logger,
	) {
		super(db, loggerInstance);
	}

	async create(input: MessageTemplateCreateInput): Promise<ServiceResult<MessageTemplate>> {
		const validatedInputResult = this.validationService.validateCreateInput(input);
		if (!validatedInputResult.success) {
			return this.resultFail(validatedInputResult.error);
		}
		const validatedInput = validatedInputResult.data;

		try {
			const placeholderResult = this.validationService.validatePlaceholders(validatedInput.body);
			if (!placeholderResult.success) {
				return this.resultFail(placeholderResult.error);
			}

			const uniquenessResult = await this.validationService.validateCreateUniqueness(validatedInput);
			if (!uniquenessResult.success) {
				return this.resultFail(uniquenessResult.error);
			}

			const template = await this.db.messageTemplate.create({
				data: {
					name: validatedInput.name,
					channel: validatedInput.channel,
					subject: validatedInput.subject,
					body: validatedInput.body,
					description: validatedInput.description,
					isActive: validatedInput.isActive,
				},
			});

			return this.resultOk(template);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail('Could not create template. Please try again later.');
		}
	}

	async update(input: MessageTemplateUpdateInput): Promise<ServiceResult<MessageTemplate>> {
		const validatedInputResult = this.validationService.validateUpdateInput(input);
		if (!validatedInputResult.success) {
			return this.resultFail(validatedInputResult.error);
		}
		const validatedInput = validatedInputResult.data;

		try {
			const existing = await this.db.messageTemplate.findUnique({
				where: { id: validatedInput.id },
				select: { id: true, name: true },
			});
			if (!existing) {
				return this.resultFail('Template not found');
			}

			const placeholderResult = this.validationService.validatePlaceholders(validatedInput.body);
			if (!placeholderResult.success) {
				return this.resultFail(placeholderResult.error);
			}

			const uniquenessResult = await this.validationService.validateUpdateUniqueness(validatedInput, existing.name);
			if (!uniquenessResult.success) {
				return this.resultFail(uniquenessResult.error);
			}

			const template = await this.db.messageTemplate.update({
				where: { id: validatedInput.id },
				data: {
					name: validatedInput.name,
					channel: validatedInput.channel,
					subject: validatedInput.subject,
					body: validatedInput.body,
					description: validatedInput.description,
					isActive: validatedInput.isActive,
				},
			});

			return this.resultOk(template);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail('Could not update template. Please try again later.');
		}
	}

	async delete(id: string): Promise<ServiceResult<void>> {
		try {
			const existing = await this.db.messageTemplate.findUnique({
				where: { id },
				select: { id: true },
			});
			if (!existing) {
				return this.resultFail('Template not found');
			}

			await this.db.messageTemplate.update({
				where: { id },
				data: { isActive: false },
			});

			return this.resultOk(undefined);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail('Could not delete template. Please try again later.');
		}
	}
}

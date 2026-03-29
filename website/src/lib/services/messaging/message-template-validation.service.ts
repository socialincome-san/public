import { PrismaClient } from '@/generated/prisma/client';
import { logger } from '@/lib/utils/logger';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import {
	MessageTemplateCreateInput,
	MessageTemplateUpdateInput,
	messageTemplateCreateInputSchema,
	messageTemplateUpdateInputSchema,
} from './message-template-form-input';

const KNOWN_PLACEHOLDERS = new Set([
	'contact.firstName',
	'contact.lastName',
	'contact.callingName',
	'contact.email',
	'contact.phone',
	'recipient.programName',
	'recipient.localPartnerName',
	'contributor.paymentReferenceId',
]);

export class MessageTemplateValidationService extends BaseService {
	constructor(db: PrismaClient, loggerInstance = logger) {
		super(db, loggerInstance);
	}

	validateCreateInput(input: MessageTemplateCreateInput): ServiceResult<MessageTemplateCreateInput> {
		const parsedInput = messageTemplateCreateInputSchema.safeParse(input);
		if (!parsedInput.success) {
			return this.resultFail(parsedInput.error.issues[0]?.message ?? 'Invalid input.');
		}

		return this.resultOk(parsedInput.data);
	}

	validateUpdateInput(input: MessageTemplateUpdateInput): ServiceResult<MessageTemplateUpdateInput> {
		const parsedInput = messageTemplateUpdateInputSchema.safeParse(input);
		if (!parsedInput.success) {
			return this.resultFail(parsedInput.error.issues[0]?.message ?? 'Invalid input.');
		}

		return this.resultOk(parsedInput.data);
	}

	async validateCreateUniqueness(input: MessageTemplateCreateInput): Promise<ServiceResult<void>> {
		const nameConflict = await this.db.messageTemplate.findUnique({
			where: { name: input.name },
			select: { id: true },
		});
		if (nameConflict) {
			return this.resultFail('A template with this name already exists.');
		}

		return this.resultOk(undefined);
	}

	async validateUpdateUniqueness(input: MessageTemplateUpdateInput, existingName: string): Promise<ServiceResult<void>> {
		if (input.name !== existingName) {
			const nameConflict = await this.db.messageTemplate.findUnique({
				where: { name: input.name },
				select: { id: true },
			});
			if (nameConflict && nameConflict.id !== input.id) {
				return this.resultFail('A template with this name already exists.');
			}
		}

		return this.resultOk(undefined);
	}

	validatePlaceholders(body: string): ServiceResult<string[]> {
		const placeholderRegex = /\{\{(\w+(?:\.\w+)*)\}\}/g;
		const found: string[] = [];
		const unknown: string[] = [];
		let match;

		while ((match = placeholderRegex.exec(body)) !== null) {
			const key = match[1];
			found.push(key);
			if (!KNOWN_PLACEHOLDERS.has(key)) {
				unknown.push(key);
			}
		}

		if (unknown.length > 0) {
			return this.resultFail(`Unknown placeholders: ${unknown.join(', ')}`);
		}

		return this.resultOk(found);
	}
}

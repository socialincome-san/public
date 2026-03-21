import { PrismaClient } from '@/generated/prisma/client';
import { logger } from '@/lib/utils/logger';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import {
	LocalPartnerFormCreateInput,
	LocalPartnerFormUpdateInput,
	localPartnerCreateInputSchema,
	localPartnerUpdateInputSchema,
} from './local-partner-form-input';
import { LocalPartnerUpdateUniquenessContext } from './local-partner-validation.types';

export class LocalPartnerValidationService extends BaseService {
	constructor(db: PrismaClient, loggerInstance = logger) {
		super(db, loggerInstance);
	}

	validateCreateInput(input: LocalPartnerFormCreateInput): ServiceResult<LocalPartnerFormCreateInput> {
		const parsedInput = localPartnerCreateInputSchema.safeParse(input);
		if (!parsedInput.success) {
			return this.resultFail(parsedInput.error.issues[0]?.message ?? 'Invalid input.');
		}

		return this.resultOk(parsedInput.data);
	}

	validateUpdateInput(input: LocalPartnerFormUpdateInput): ServiceResult<LocalPartnerFormUpdateInput> {
		const parsedInput = localPartnerUpdateInputSchema.safeParse(input);
		if (!parsedInput.success) {
			return this.resultFail(parsedInput.error.issues[0]?.message ?? 'Invalid input.');
		}

		return this.resultOk(parsedInput.data);
	}

	async validateCreateUniqueness(input: LocalPartnerFormCreateInput): Promise<ServiceResult<void>> {
		const nameConflict = await this.db.localPartner.findUnique({
			where: { name: input.name },
			select: { id: true },
		});
		if (nameConflict) {
			return this.resultFail('A local partner with this name already exists.');
		}

		const emailConflict = await this.db.contact.findUnique({
			where: { email: input.contact.email },
			select: { id: true },
		});
		if (emailConflict) {
			return this.resultFail('A contact with this email already exists.');
		}

		if (input.contact.phone) {
			const phoneConflict = await this.db.phone.findUnique({
				where: { number: input.contact.phone },
				select: { id: true },
			});
			if (phoneConflict) {
				return this.resultFail('A contact with this phone number already exists.');
			}
		}

		return this.resultOk(undefined);
	}

	async validateUpdateUniqueness(
		input: LocalPartnerFormUpdateInput,
		context: LocalPartnerUpdateUniquenessContext,
	): Promise<ServiceResult<void>> {
		if (input.name !== context.existingName) {
			const nameConflict = await this.db.localPartner.findUnique({
				where: { name: input.name },
				select: { id: true },
			});
			if (nameConflict && nameConflict.id !== context.partnerId) {
				return this.resultFail('A local partner with this name already exists.');
			}
		}

		if (input.contact.email !== context.existingEmail) {
			const emailConflict = await this.db.contact.findUnique({
				where: { email: input.contact.email },
				select: { id: true },
			});
			if (emailConflict && emailConflict.id !== context.existingContactId) {
				return this.resultFail('A contact with this email already exists.');
			}
		}

		const newPhone = input.contact.phone ?? null;
		if (newPhone && newPhone !== context.existingPhoneNumber) {
			const phoneConflict = await this.db.phone.findUnique({
				where: { number: newPhone },
				select: { id: true },
			});
			if (phoneConflict && phoneConflict.id !== context.existingPhoneId) {
				return this.resultFail('A contact with this phone number already exists.');
			}
		}

		return this.resultOk(undefined);
	}
}

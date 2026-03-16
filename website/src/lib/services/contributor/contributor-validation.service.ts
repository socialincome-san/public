import { PrismaClient } from '@/generated/prisma/client';
import { logger } from '@/lib/utils/logger';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import {
	ContributorFormCreateInput,
	ContributorFormUpdateInput,
	contributorCreateInputSchema,
	contributorUpdateInputSchema,
} from './contributor-form-input';

type ContributorUpdateUniquenessContext = {
	existingContactId: string;
	existingEmail: string | null;
	existingPhoneId: string | null;
	existingPhoneNumber: string | null;
};

export class ContributorValidationService extends BaseService {
	constructor(db: PrismaClient, loggerInstance = logger) {
		super(db, loggerInstance);
	}

	validateCreateInput(input: ContributorFormCreateInput): ServiceResult<ContributorFormCreateInput> {
		const parsedInput = contributorCreateInputSchema.safeParse(input);
		if (!parsedInput.success) {
			return this.resultFail(parsedInput.error.issues[0]?.message ?? 'Invalid input.');
		}
		return this.resultOk(parsedInput.data);
	}

	validateUpdateInput(input: ContributorFormUpdateInput): ServiceResult<ContributorFormUpdateInput> {
		const parsedInput = contributorUpdateInputSchema.safeParse(input);
		if (!parsedInput.success) {
			return this.resultFail(parsedInput.error.issues[0]?.message ?? 'Invalid input.');
		}
		return this.resultOk(parsedInput.data);
	}

	async validateCreateUniqueness(input: ContributorFormCreateInput): Promise<ServiceResult<void>> {
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
		input: ContributorFormUpdateInput,
		context: ContributorUpdateUniquenessContext,
	): Promise<ServiceResult<void>> {
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

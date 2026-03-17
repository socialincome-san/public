import { PrismaClient } from '@/generated/prisma/client';
import { logger } from '@/lib/utils/logger';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { UserFormCreateInput, UserFormUpdateInput, userCreateInputSchema, userUpdateInputSchema } from './user-form-input';

type UpdateUniquenessContext = {
	contactId: string;
	existingEmail: string | null;
};

export class UserValidationService extends BaseService {
	constructor(db: PrismaClient, loggerInstance = logger) {
		super(db, loggerInstance);
	}

	validateCreateInput(input: UserFormCreateInput): ServiceResult<UserFormCreateInput> {
		const parsedInput = userCreateInputSchema.safeParse(input);
		if (!parsedInput.success) {
			return this.resultFail(parsedInput.error.issues[0]?.message ?? 'Invalid input.');
		}

		return this.resultOk(parsedInput.data);
	}

	validateUpdateInput(input: UserFormUpdateInput): ServiceResult<UserFormUpdateInput> {
		const parsedInput = userUpdateInputSchema.safeParse(input);
		if (!parsedInput.success) {
			return this.resultFail(parsedInput.error.issues[0]?.message ?? 'Invalid input.');
		}

		return this.resultOk(parsedInput.data);
	}

	async validateCreateUniqueness(input: UserFormCreateInput): Promise<ServiceResult<void>> {
		const emailConflict = await this.db.contact.findUnique({
			where: { email: input.email },
			select: { id: true },
		});

		if (emailConflict) {
			return this.resultFail('A user with this email already exists.');
		}

		return this.resultOk(undefined);
	}

	async validateUpdateUniqueness(
		input: UserFormUpdateInput,
		context: UpdateUniquenessContext,
	): Promise<ServiceResult<void>> {
		if (input.email !== context.existingEmail) {
			const emailConflict = await this.db.contact.findUnique({
				where: { email: input.email },
				select: { id: true },
			});

			if (emailConflict && emailConflict.id !== context.contactId) {
				return this.resultFail('A user with this email already exists.');
			}
		}

		return this.resultOk(undefined);
	}
}

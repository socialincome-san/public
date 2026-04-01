import { PrismaClient } from '@/generated/prisma/client';
import { logger } from '@/lib/utils/logger';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import {
	FocusFormCreateInput,
	FocusFormUpdateInput,
	focusCreateInputSchema,
	focusUpdateInputSchema,
} from './focus-form-input';
import type { FocusUpdateUniquenessContext } from './focus-validation.types';

export class FocusValidationService extends BaseService {
	constructor(db: PrismaClient, loggerInstance = logger) {
		super(db, loggerInstance);
	}

	validateCreateInput(input: FocusFormCreateInput): ServiceResult<FocusFormCreateInput> {
		const parsedInput = focusCreateInputSchema.safeParse(input);
		if (!parsedInput.success) {
			return this.resultFail(parsedInput.error.issues[0]?.message ?? 'Invalid input.');
		}

		return this.resultOk(parsedInput.data);
	}

	validateUpdateInput(input: FocusFormUpdateInput): ServiceResult<FocusFormUpdateInput> {
		const parsedInput = focusUpdateInputSchema.safeParse(input);
		if (!parsedInput.success) {
			return this.resultFail(parsedInput.error.issues[0]?.message ?? 'Invalid input.');
		}

		return this.resultOk(parsedInput.data);
	}

	async validateCreateUniqueness(input: FocusFormCreateInput): Promise<ServiceResult<void>> {
		const nameConflict = await this.db.focus.findUnique({
			where: { name: input.name },
			select: { id: true },
		});
		if (nameConflict) {
			return this.resultFail('A focus with this name already exists.');
		}

		return this.resultOk(undefined);
	}

	async validateUpdateUniqueness(
		input: FocusFormUpdateInput,
		context: FocusUpdateUniquenessContext,
	): Promise<ServiceResult<void>> {
		if (input.name !== context.existingName) {
			const nameConflict = await this.db.focus.findUnique({
				where: { name: input.name },
				select: { id: true },
			});
			if (nameConflict && nameConflict.id !== context.focusId) {
				return this.resultFail('A focus with this name already exists.');
			}
		}

		return this.resultOk(undefined);
	}
}

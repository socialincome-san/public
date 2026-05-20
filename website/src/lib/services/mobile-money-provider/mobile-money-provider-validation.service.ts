import { PrismaClient } from '@/generated/prisma/client';
import { logger } from '@/lib/utils/logger';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import {
	MobileMoneyProviderFormCreateInput,
	MobileMoneyProviderFormUpdateInput,
	mobileMoneyProviderCreateInputSchema,
	mobileMoneyProviderUpdateInputSchema,
} from './mobile-money-provider-form-input';
import { MobileMoneyProviderUpdateUniquenessContext } from './mobile-money-provider-validation.types';

export class MobileMoneyProviderValidationService extends BaseService {
	constructor(db: PrismaClient, loggerInstance = logger) {
		super(db, loggerInstance);
	}

	async validateParentId(
		parentId: string | null | undefined,
		context?: { providerId?: string },
	): Promise<ServiceResult<void>> {
		if (!parentId) {
			return this.resultOk(undefined);
		}

		if (context?.providerId && parentId === context.providerId) {
			return this.resultFail('A mobile money provider cannot be its own parent.');
		}

		const exists = await this.db.mobileMoneyProvider.findUnique({
			where: { id: parentId },
			select: { id: true },
		});
		if (!exists) {
			return this.resultFail('Selected parent mobile money provider does not exist.');
		}

		return this.resultOk(undefined);
	}

	validateCreateInput(input: MobileMoneyProviderFormCreateInput): ServiceResult<MobileMoneyProviderFormCreateInput> {
		const parsedInput = mobileMoneyProviderCreateInputSchema.safeParse(input);
		if (!parsedInput.success) {
			return this.resultFail(parsedInput.error.issues[0]?.message ?? 'Invalid input.');
		}

		return this.resultOk(parsedInput.data);
	}

	validateUpdateInput(input: MobileMoneyProviderFormUpdateInput): ServiceResult<MobileMoneyProviderFormUpdateInput> {
		const parsedInput = mobileMoneyProviderUpdateInputSchema.safeParse(input);
		if (!parsedInput.success) {
			return this.resultFail(parsedInput.error.issues[0]?.message ?? 'Invalid input.');
		}

		return this.resultOk(parsedInput.data);
	}

	async validateCreateUniqueness(input: MobileMoneyProviderFormCreateInput): Promise<ServiceResult<void>> {
		const nameConflict = await this.db.mobileMoneyProvider.findUnique({
			where: { name: input.name },
			select: { id: true },
		});
		if (nameConflict) {
			return this.resultFail('A mobile money provider with this name already exists.');
		}

		return this.resultOk(undefined);
	}

	async validateUpdateUniqueness(
		input: MobileMoneyProviderFormUpdateInput,
		context: MobileMoneyProviderUpdateUniquenessContext,
	): Promise<ServiceResult<void>> {
		if (input.name !== context.existingName) {
			const nameConflict = await this.db.mobileMoneyProvider.findUnique({
				where: { name: input.name },
				select: { id: true },
			});
			if (nameConflict && nameConflict.id !== context.providerId) {
				return this.resultFail('A mobile money provider with this name already exists.');
			}
		}

		return this.resultOk(undefined);
	}
}

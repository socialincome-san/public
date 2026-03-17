import { PrismaClient } from '@/generated/prisma/client';
import { logger } from '@/lib/utils/logger';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import {
	OrganizationFormCreateInput,
	OrganizationFormUpdateInput,
	organizationCreateInputSchema,
	organizationUpdateInputSchema,
} from './organization-form-input';
import { OrganizationUpdateUniquenessContext } from './organization-validation.types';

export class OrganizationValidationService extends BaseService {
	constructor(db: PrismaClient, loggerInstance = logger) {
		super(db, loggerInstance);
	}

	validateCreateInput(input: OrganizationFormCreateInput): ServiceResult<OrganizationFormCreateInput> {
		const parsedInput = organizationCreateInputSchema.safeParse(input);
		if (!parsedInput.success) {
			return this.resultFail(parsedInput.error.issues[0]?.message ?? 'Invalid input.');
		}

		return this.resultOk(parsedInput.data);
	}

	validateUpdateInput(input: OrganizationFormUpdateInput): ServiceResult<OrganizationFormUpdateInput> {
		const parsedInput = organizationUpdateInputSchema.safeParse(input);
		if (!parsedInput.success) {
			return this.resultFail(parsedInput.error.issues[0]?.message ?? 'Invalid input.');
		}

		return this.resultOk(parsedInput.data);
	}

	async validateCreateUniqueness(input: OrganizationFormCreateInput): Promise<ServiceResult<void>> {
		const existingByName = await this.db.organization.findUnique({
			where: { name: input.name },
			select: { id: true },
		});
		if (existingByName) {
			return this.resultFail('An organization with this name already exists.');
		}

		return this.resultOk(undefined);
	}

	async validateUpdateUniqueness(
		input: OrganizationFormUpdateInput,
		context: OrganizationUpdateUniquenessContext,
	): Promise<ServiceResult<void>> {
		if (input.name !== context.existingName) {
			const existingByName = await this.db.organization.findUnique({
				where: { name: input.name },
				select: { id: true },
			});
			if (existingByName && existingByName.id !== context.organizationId) {
				return this.resultFail('An organization with this name already exists.');
			}
		}

		return this.resultOk(undefined);
	}
}

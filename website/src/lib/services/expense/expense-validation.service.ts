import { PrismaClient } from '@/generated/prisma/client';
import { logger } from '@/lib/utils/logger';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import {
	ExpenseFormCreateInput,
	ExpenseFormUpdateInput,
	expenseCreateInputSchema,
	expenseUpdateInputSchema,
} from './expense-form-input';

export class ExpenseValidationService extends BaseService {
	constructor(db: PrismaClient, loggerInstance = logger) {
		super(db, loggerInstance);
	}

	validateCreateInput(input: ExpenseFormCreateInput): ServiceResult<ExpenseFormCreateInput> {
		const parsedInput = expenseCreateInputSchema.safeParse(input);
		if (!parsedInput.success) {
			return this.resultFail(parsedInput.error.issues[0]?.message ?? 'Invalid input.');
		}
		return this.resultOk(parsedInput.data);
	}

	validateUpdateInput(input: ExpenseFormUpdateInput): ServiceResult<ExpenseFormUpdateInput> {
		const parsedInput = expenseUpdateInputSchema.safeParse(input);
		if (!parsedInput.success) {
			return this.resultFail(parsedInput.error.issues[0]?.message ?? 'Invalid input.');
		}
		return this.resultOk(parsedInput.data);
	}

	async validateOrganizationExists(organizationId: string): Promise<ServiceResult<void>> {
		const organization = await this.db.organization.findUnique({
			where: { id: organizationId },
			select: { id: true },
		});

		if (!organization) {
			return this.resultFail('Organization not found.');
		}

		return this.resultOk(undefined);
	}
}

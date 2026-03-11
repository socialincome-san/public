import { PrismaClient } from '@/generated/prisma/client';
import { logger } from '@/lib/utils/logger';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { UserReadService } from '../user/user-read.service';
import { ExpenseFormCreateInput, ExpenseFormUpdateInput } from './expense-form-input';
import { ExpensePayload } from './expense.types';
import { ExpenseValidationService } from './expense-validation.service';

export class ExpenseWriteService extends BaseService {
	constructor(
		db: PrismaClient,
		private readonly userService: UserReadService,
		private readonly expenseValidationService: ExpenseValidationService,
		loggerInstance = logger,
	) {
		super(db, loggerInstance);
	}

	async create(userId: string, input: ExpenseFormCreateInput): Promise<ServiceResult<ExpensePayload>> {
		try {
			const isAdminResult = await this.userService.isAdmin(userId);

			if (!isAdminResult.success) {
				return this.resultFail(isAdminResult.error);
			}

			const validatedInputResult = this.expenseValidationService.validateCreateInput(input);
			if (!validatedInputResult.success) {
				return this.resultFail(validatedInputResult.error);
			}
			const validatedInput = validatedInputResult.data;

			const organizationExistsResult = await this.expenseValidationService.validateOrganizationExists(
				validatedInput.organizationId,
			);
			if (!organizationExistsResult.success) {
				return this.resultFail(organizationExistsResult.error);
			}

			const created = await this.db.expense.create({
				data: {
					type: validatedInput.type,
					year: validatedInput.year,
					amountChf: validatedInput.amountChf,
					organization: {
						connect: { id: validatedInput.organizationId },
					},
				},
				include: { organization: { select: { id: true, name: true } } },
			});

			return this.resultOk({
				id: created.id,
				type: created.type,
				year: created.year,
				amountChf: Number(created.amountChf),
				organization: created.organization,
			});
		} catch (error) {
			this.logger.error(error);
			return this.resultFail('Could not create expense. Please try again later.');
		}
	}

	async update(userId: string, input: ExpenseFormUpdateInput): Promise<ServiceResult<ExpensePayload>> {
		try {
			const isAdminResult = await this.userService.isAdmin(userId);

			if (!isAdminResult.success) {
				return this.resultFail(isAdminResult.error);
			}

			const validatedInputResult = this.expenseValidationService.validateUpdateInput(input);
			if (!validatedInputResult.success) {
				return this.resultFail(validatedInputResult.error);
			}
			const validatedInput = validatedInputResult.data;

			if (!validatedInput.id) {
				return this.resultFail('Expense id is required.');
			}

			const organizationExistsResult = await this.expenseValidationService.validateOrganizationExists(
				validatedInput.organizationId,
			);
			if (!organizationExistsResult.success) {
				return this.resultFail(organizationExistsResult.error);
			}

			const updated = await this.db.expense.update({
				where: { id: validatedInput.id },
				data: {
					type: validatedInput.type,
					year: validatedInput.year,
					amountChf: validatedInput.amountChf,
					organization: {
						connect: { id: validatedInput.organizationId },
					},
				},
				include: { organization: { select: { id: true, name: true } } },
			});

			return this.resultOk({
				id: updated.id,
				type: updated.type,
				year: updated.year,
				amountChf: Number(updated.amountChf),
				organization: updated.organization,
			});
		} catch (error) {
			this.logger.error(error);
			return this.resultFail('Could not update expense. Please try again later.');
		}
	}
}

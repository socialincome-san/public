import { PrismaClient } from '@/generated/prisma/client';
import { logger } from '@/lib/utils/logger';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { UserReadService } from '../user/user-read.service';
import { ExpenseCreateInput, ExpensePayload, ExpenseUpdateInput } from './expense.types';

export class ExpenseWriteService extends BaseService {
	constructor(
		db: PrismaClient,
		private readonly userService: UserReadService,
		loggerInstance = logger,
	) {
		super(db, loggerInstance);
	}

	async create(userId: string, input: ExpenseCreateInput): Promise<ServiceResult<ExpensePayload>> {
		try {
			const isAdminResult = await this.userService.isAdmin(userId);

			if (!isAdminResult.success) {
				return this.resultFail(isAdminResult.error);
			}

			const created = await this.db.expense.create({
				data: input,
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
			return this.resultFail(`Could not create expense: ${JSON.stringify(error)}`);
		}
	}

	async update(userId: string, input: ExpenseUpdateInput): Promise<ServiceResult<ExpensePayload>> {
		try {
			const isAdminResult = await this.userService.isAdmin(userId);

			if (!isAdminResult.success) {
				return this.resultFail(isAdminResult.error);
			}

			const updated = await this.db.expense.update({
				where: { id: input.id },
				data: input,
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
			return this.resultFail(`Could not update expense: ${JSON.stringify(error)}`);
		}
	}
}

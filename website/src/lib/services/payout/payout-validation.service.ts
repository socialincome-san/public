import { PrismaClient } from '@/generated/prisma/client';
import { logger } from '@/lib/utils/logger';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import {
	PayoutFormCreateInput,
	PayoutFormUpdateInput,
	payoutCreateInputSchema,
	payoutUpdateInputSchema,
} from './payout-form-input';

export class PayoutValidationService extends BaseService {
	constructor(db: PrismaClient, loggerInstance = logger) {
		super(db, loggerInstance);
	}

	validateCreateInput(input: PayoutFormCreateInput): ServiceResult<PayoutFormCreateInput> {
		const parsed = payoutCreateInputSchema.safeParse(input);
		if (!parsed.success) {
			return this.resultFail(parsed.error.issues[0]?.message ?? 'Invalid input.');
		}
		return this.resultOk(parsed.data);
	}

	validateUpdateInput(input: PayoutFormUpdateInput): ServiceResult<PayoutFormUpdateInput> {
		const parsed = payoutUpdateInputSchema.safeParse(input);
		if (!parsed.success) {
			return this.resultFail(parsed.error.issues[0]?.message ?? 'Invalid input.');
		}
		return this.resultOk(parsed.data);
	}
}

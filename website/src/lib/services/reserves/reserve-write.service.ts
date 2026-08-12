import { type PrismaClient } from '@/generated/prisma/client';
import { logger } from '@/lib/utils/logger';
import { BaseService } from '../core/base.service';
import { type ServiceResult } from '../core/base.types';
import { type ReserveCreateInput } from './reserve.types';

export class ReserveWriteService extends BaseService {
	constructor(db: PrismaClient, loggerInstance = logger) {
		super(db, loggerInstance);
	}

	async createMany(reserves: ReserveCreateInput[]): Promise<ServiceResult<number>> {
		try {
			if (reserves.length === 0) {
				return this.resultOk(0);
			}

			const { count } = await this.db.reserve.createMany({ data: reserves });

			return this.resultOk(count);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not create reserves: ${JSON.stringify(error)}`);
		}
	}
}

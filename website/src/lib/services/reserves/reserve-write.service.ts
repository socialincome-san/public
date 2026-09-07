import { BaseService } from '../core/base.service';
import { type ServiceResult } from '../core/base.types';
import { type ReserveCreateInput } from './reserve.types';

export class ReserveWriteService extends BaseService {
	async createMany(reserves: ReserveCreateInput[]): Promise<ServiceResult<number>> {
		try {
			if (reserves.length === 0) {
				return this.resultOk(0);
			}

			const { count } = await this.db.reserve.createMany({ data: reserves, skipDuplicates: true });

			return this.resultOk(count);
		} catch (error) {
			console.error(error);

			return this.resultFail(`Could not create reserves: ${JSON.stringify(error)}`);
		}
	}
}

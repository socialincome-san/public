import { Payout as PrismaPayout } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { CreatePayoutInput } from './payout.types';

export class PayoutService extends BaseService {
	async create(input: CreatePayoutInput): Promise<ServiceResult<PrismaPayout>> {
		try {
			const payout = await this.db.payout.create({
				data: input,
			});

			return this.resultOk(payout);
		} catch (e) {
			console.error('[PayoutService.create]', e);
			return this.resultFail('Could not create payout');
		}
	}
}

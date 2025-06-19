import { LocalPartner } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { CreateLocalPartnerInput } from './local-partner.types';

export class LocalPartnerService extends BaseService {
	async create(input: CreateLocalPartnerInput): Promise<ServiceResult<LocalPartner>> {
		try {
			const partner = await this.db.localPartner.create({
				data: input,
			});
			return this.resultOk(partner);
		} catch (e) {
			console.error('[LocalPartnerService.create]', e);
			return this.resultFail('Could not create local partner');
		}
	}

	async findByName(name: string): Promise<LocalPartner | null> {
		try {
			return await this.db.localPartner.findUnique({
				where: { name },
			});
		} catch (e) {
			console.error(`[LocalPartnerService.findByName] Failed to find local partner with name "${name}"`, e);
			return null;
		}
	}
}

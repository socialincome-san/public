import { Recipient } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { CreateRecipientInput } from './recipient.types';

export class RecipientService extends BaseService {
	async create(input: CreateRecipientInput): Promise<ServiceResult<Recipient>> {
		try {
			const recipient = await this.db.recipient.create({
				data: input,
			});
			return this.resultOk(recipient);
		} catch (e) {
			console.error('[RecipientService.create]', e);
			return this.resultFail('Could not create recipient');
		}
	}
}

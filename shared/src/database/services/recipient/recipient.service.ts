import { Recipient } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { PaginationOptions, ServiceResult } from '../core/base.types';
import { CreateRecipientInput, RecipientTableDbShape } from './recipient.types';

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

	async findMany(options?: PaginationOptions): Promise<ServiceResult<Recipient[]>> {
		try {
			const recipients = await this.db.recipient.findMany({
				orderBy: { createdAt: 'desc' },
				...options,
			});
			return this.resultOk(recipients);
		} catch (e) {
			console.error('[RecipientService.findMany]', e);
			return this.resultFail('Could not fetch recipients');
		}
	}

	async getRecipientsForProgram(programId: string, userId: string): Promise<ServiceResult<RecipientTableDbShape[]>> {
		try {
			const recipients = await this.db.recipient.findMany({
				where: {
					programId,
					program: {
						OR: [
							{ viewerOrganization: { users: { some: { id: userId } } } },
							{ operatorOrganization: { users: { some: { id: userId } } } },
						],
					},
				},
				select: {
					id: true,
					status: true,
					localPartner: { select: { name: true } },
					user: { select: { firstName: true, lastName: true, birthDate: true } },
				},
				orderBy: { createdAt: 'desc' },
			});

			return this.resultOk(recipients);
		} catch (e) {
			console.error('[RecipientService.getRecipientsForProgram]', e);
			return this.resultFail('Could not fetch recipients');
		}
	}

	async getRecipientForAuthUser(recipientId: string, authUserId: string): Promise<ServiceResult<Recipient | null>> {
		try {
			const recipient = await this.db.recipient.findFirst({
				where: {
					id: recipientId,
					user: { authUserId },
				},
			});
			return this.resultOk(recipient);
		} catch (e) {
			console.error('[RecipientService.getRecipientForAuthUser]', e);
			return this.resultFail('Could not fetch recipient');
		}
	}
}

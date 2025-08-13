import { Recipient } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { PaginationOptions, ServiceResult } from '../core/base.types';
import { CreateRecipientInput, RecipientTableRow } from './recipient.types';

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

	async getRecipientTableRows(programId: string, userId: string): Promise<ServiceResult<RecipientTableRow[]>> {
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
					user: {
						select: {
							firstName: true,
							lastName: true,
						},
					},
				},
				orderBy: { createdAt: 'desc' },
			});
			const mappedRecipients = recipients.map((r) => this.toRecipientTableRow(r));
			return this.resultOk(mappedRecipients);
		} catch (e) {
			console.error('[RecipientService.getRecipientTableRows]', e);
			return this.resultFail('Could not fetch recipient table rows');
		}
	}

	private toRecipientTableRow(r: {
		id: string;
		user: { firstName: string | null; lastName: string | null } | null;
	}): RecipientTableRow {
		return {
			id: r.id,
			firstName: r.user?.firstName ?? '',
			lastName: r.user?.lastName ?? '',
		};
	}
}

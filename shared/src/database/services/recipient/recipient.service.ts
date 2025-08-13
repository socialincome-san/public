import { Recipient, RecipientStatus } from '@prisma/client';
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
					status: true,
					localPartner: { select: { name: true } },
					user: {
						select: {
							firstName: true,
							lastName: true,
							birthDate: true,
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

	private toRecipientTableRow(recipient: {
		id: string;
		status: RecipientStatus;
		localPartner: { name: string } | null;
		user: { firstName: string | null; lastName: string | null; birthDate: Date | null } | null;
	}): RecipientTableRow {
		return {
			id: recipient.id,
			firstName: recipient.user?.firstName ?? '',
			lastName: recipient.user?.lastName ?? '',
			age: recipient.user?.birthDate ? this.calculateAge(recipient.user.birthDate) : null,
			status: recipient.status,
			localPartnerName: recipient.localPartner?.name ?? '',
		};
	}

	private calculateAge(birthDate: Date): number {
		const today = new Date();
		let age = today.getFullYear() - birthDate.getFullYear();
		const monthDiff = today.getMonth() - birthDate.getMonth();
		if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
			age--;
		}
		return age;
	}
}

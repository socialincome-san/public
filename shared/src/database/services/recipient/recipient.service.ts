import { PayoutStatus, Recipient, RecipientStatus } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { PaginationOptions, ServiceResult } from '../core/base.types';
import { CreateRecipientInput, RecipientForecastShape, RecipientTableDbShape } from './recipient.types';

export class RecipientService extends BaseService {
	async create(input: CreateRecipientInput): Promise<ServiceResult<Recipient>> {
		try {
			const recipient = await this.db.recipient.create({ data: input });
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
			const rows = await this.db.recipient.findMany({
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
					program: { select: { totalPayments: true } },
					payouts: {
						where: { status: { in: [PayoutStatus.paid, PayoutStatus.confirmed] } },
						select: { id: true },
					},
				},
				orderBy: { createdAt: 'desc' },
			});

			const recipients: RecipientTableDbShape[] = rows.map((row) => ({
				id: row.id,
				status: row.status,
				localPartner: row.localPartner,
				user: row.user,
				program: row.program,
				payoutsPaidCount: row.payouts.length,
			}));

			return this.resultOk(recipients);
		} catch (e) {
			console.error('[RecipientService.getRecipientsForProgram]', e);
			return this.resultFail('Could not fetch recipients');
		}
	}

	async getRecipientsForForecast(programId: string): Promise<ServiceResult<RecipientForecastShape[]>> {
		try {
			const rows = await this.db.recipient.findMany({
				where: { programId, status: { in: [RecipientStatus.active, RecipientStatus.designated] } },
				select: { status: true, startDate: true },
			});
			return this.resultOk(rows);
		} catch (e) {
			console.error('[RecipientService.getRecipientsForForecast]', e);
			return this.resultFail('Could not fetch recipients for forecast');
		}
	}
}

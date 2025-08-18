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

	async getRecipientsWithProgramPermission(
		programId: string,
		userId: string,
	): Promise<ServiceResult<{ recipients: RecipientTableDbShape[]; programPermission: 'operator' | 'viewer' }>> {
		try {
			const program = await this.db.program.findFirst({
				where: {
					id: programId,
					OR: [
						{ viewerOrganization: { users: { some: { id: userId } } } },
						{ operatorOrganization: { users: { some: { id: userId } } } },
					],
				},
				select: {
					operatorOrganization: { select: { users: { where: { id: userId }, select: { id: true }, take: 1 } } },
					viewerOrganization: { select: { users: { where: { id: userId }, select: { id: true }, take: 1 } } },

					recipients: {
						orderBy: { createdAt: 'desc' },
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
					},
				},
			});

			if (!program) return this.resultFail('Program not found or access denied');

			const programPermission: 'operator' | 'viewer' =
				(program.operatorOrganization?.users?.length ?? 0) > 0 ? 'operator' : 'viewer';

			const recipients: RecipientTableDbShape[] = program.recipients.map((row) => ({
				id: row.id,
				status: row.status,
				localPartner: row.localPartner,
				user: row.user,
				program: row.program,
				payoutsPaidCount: row.payouts.length,
			}));

			return this.resultOk({ recipients, programPermission });
		} catch (e) {
			console.error('[RecipientService.getRecipientsWithRoleForProgram]', e);
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

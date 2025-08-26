import { PayoutStatus, Recipient as PrismaRecipient, RecipientStatus } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { PaginationOptions, ServiceResult } from '../core/base.types';
import { CreateRecipientInput, ProgramPermission, RecipientTableView, RecipientTableViewRow } from './recipient.types';

export class RecipientService extends BaseService {
	async findMany(options?: PaginationOptions): Promise<ServiceResult<PrismaRecipient[]>> {
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

	async create(input: CreateRecipientInput): Promise<ServiceResult<PrismaRecipient>> {
		try {
			const recipient = await this.db.recipient.create({ data: input });
			return this.resultOk(recipient);
		} catch (e) {
			console.error('[RecipientService.create]', e);
			return this.resultFail('Could not create recipient');
		}
	}

	async getRecipientTableView(userId: string): Promise<ServiceResult<RecipientTableView>> {
		try {
			const recipients = await this.db.recipient.findMany({
				where: { program: this.userAccessibleProgramsWhere(userId) },
				orderBy: { createdAt: 'desc' },
				select: {
					id: true,
					status: true,
					localPartner: { select: { name: true } },
					user: { select: { firstName: true, lastName: true, birthDate: true } },
					program: {
						select: {
							id: true,
							name: true,
							totalPayments: true,
							operatorOrganization: {
								select: { users: { where: { id: userId }, select: { id: true }, take: 1 } },
							},
							viewerOrganization: {
								select: { users: { where: { id: userId }, select: { id: true }, take: 1 } },
							},
						},
					},
					payouts: {
						where: { status: { in: [PayoutStatus.paid, PayoutStatus.confirmed] } },
						select: { id: true },
					},
				},
			});

			const tableRows: RecipientTableViewRow[] = recipients.map((recipient) => {
				const payoutsReceived = recipient.payouts.length;
				const payoutsTotal = recipient.program?.totalPayments ?? 0;
				const payoutsProgressPercent = payoutsTotal > 0 ? Math.round((payoutsReceived / payoutsTotal) * 100) : 0;

				const birthDate = recipient.user?.birthDate ?? null;
				const age = birthDate ? this.calculateAgeFromBirthDate(birthDate) : null;

				const userIsOperator = (recipient.program?.operatorOrganization?.users?.length ?? 0) > 0;
				const permission: ProgramPermission = userIsOperator ? 'operator' : 'viewer';

				return {
					id: recipient.id,
					firstName: recipient.user?.firstName ?? '',
					lastName: recipient.user?.lastName ?? '',
					age,
					status: recipient.status as RecipientStatus,
					payoutsReceived,
					payoutsTotal,
					payoutsProgressPercent,
					localPartnerName: recipient.localPartner?.name ?? '',
					programName: recipient.program?.name ?? '',
					programId: recipient.program?.id ?? '',
					permission,
				};
			});

			return this.resultOk({ tableRows });
		} catch (error) {
			console.error('[RecipientService.getRecipientTableView]', error);
			return this.resultFail('Could not fetch recipients');
		}
	}

	async getRecipientTableViewProgramScoped(
		userId: string,
		programId: string,
	): Promise<ServiceResult<RecipientTableView>> {
		const base = await this.getRecipientTableView(userId);
		if (!base.success) return base;

		const filteredRows = base.data.tableRows.filter((row) => row.programId === programId);
		return this.resultOk({ tableRows: filteredRows });
	}

	private calculateAgeFromBirthDate(birthDate: Date): number {
		const today = new Date();
		let years = today.getFullYear() - birthDate.getFullYear();
		const monthDifference = today.getMonth() - birthDate.getMonth();
		const dayDifference = today.getDate() - birthDate.getDate();
		if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
			years -= 1;
		}
		return years;
	}
}

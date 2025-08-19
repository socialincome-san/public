import { PayoutStatus, Recipient, RecipientStatus } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { PaginationOptions, ServiceResult } from '../core/base.types';
import {
	CreateRecipientInput,
	ProgramPermission,
	RecipientTableViewRow,
	RecipientTableViewWithPermission,
} from './recipient.types';

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

	async getRecipientTableViewForProgramAndUser(
		programId: string,
		userId: string,
	): Promise<ServiceResult<RecipientTableViewWithPermission>> {
		try {
			const program = await this.db.program.findFirst({
				where: { id: programId, ...this.userAccessibleProgramsWhere(userId) },
				select: {
					...this.programPermissionSelect(userId),
					recipients: this.recipientsSelectForTableView(),
				},
			});

			if (!program) return this.resultFail('Program not found or access denied');

			const programPermission: ProgramPermission =
				(program.operatorOrganization?.users?.length ?? 0) > 0 ? 'operator' : 'viewer';

			const tableRows = this.mapRecipientsToTableViewRows(program.recipients);

			return this.resultOk({ tableRows, programPermission });
		} catch (e) {
			console.error('[RecipientService.getRecipientTableViewForProgramAndUser]', e);
			return this.resultFail('Could not fetch recipients');
		}
	}

	private userAccessibleProgramsWhere(userId: string) {
		return {
			OR: [
				{ viewerOrganization: { users: { some: { id: userId } } } },
				{ operatorOrganization: { users: { some: { id: userId } } } },
			],
		};
	}

	private programPermissionSelect(userId: string) {
		return {
			operatorOrganization: {
				select: { users: { where: { id: userId }, select: { id: true }, take: 1 } },
			},
			viewerOrganization: {
				select: { users: { where: { id: userId }, select: { id: true }, take: 1 } },
			},
		};
	}

	private recipientsSelectForTableView() {
		return {
			orderBy: { createdAt: 'desc' as const },
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
		};
	}

	private mapRecipientsToTableViewRows(
		rows: Array<{
			id: string;
			status: RecipientStatus;
			localPartner: { name: string | null } | null;
			user: { firstName: string | null; lastName: string | null; birthDate: Date | null } | null;
			program: { totalPayments: number } | null;
			payouts: Array<{ id: string }>;
		}>,
	): RecipientTableViewRow[] {
		return rows.map((recipient) => {
			const payoutsReceived = recipient.payouts.length;
			const payoutsTotal = recipient.program?.totalPayments ?? 0;
			const payoutsProgressPercent = payoutsTotal > 0 ? Math.round((payoutsReceived / payoutsTotal) * 100) : 0;

			const age = recipient.user?.birthDate ? this.calculateAge(recipient.user.birthDate) : null;

			return {
				id: recipient.id,
				status: recipient.status,
				localPartnerName: recipient.localPartner?.name ?? '',
				firstName: recipient.user?.firstName ?? '',
				lastName: recipient.user?.lastName ?? '',
				age,
				payoutsReceived,
				payoutsTotal,
				payoutsProgressPercent,
			};
		});
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

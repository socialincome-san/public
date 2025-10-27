import { ProgramPermission, RecipientStatus } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { ProgramAccessService } from '../program-access/program-access.service';
import { RecipientTableView, RecipientTableViewRow } from './recipient.types';

export class RecipientService extends BaseService {
	private programAccessService = new ProgramAccessService();

	async getTableView(userId: string): Promise<ServiceResult<RecipientTableView>> {
		try {
			const accessResult = await this.programAccessService.getAccessiblePrograms(userId);
			if (!accessResult.success) {
				return this.resultFail(accessResult.error);
			}

			const accessiblePrograms = accessResult.data;
			if (accessiblePrograms.length === 0) {
				return this.resultOk({ tableRows: [] });
			}

			const programIds = accessiblePrograms.map((p) => p.programId);

			const recipients = await this.db.recipient.findMany({
				where: {
					programId: { in: programIds },
				},
				select: {
					id: true,
					status: true,
					contact: {
						select: {
							firstName: true,
							lastName: true,
							dateOfBirth: true,
						},
					},
					program: {
						select: {
							id: true,
							name: true,
							totalPayments: true,
						},
					},
					localPartner: {
						select: { name: true },
					},
					payouts: {
						select: { id: true },
					},
					createdAt: true,
				},
				orderBy: { createdAt: 'desc' },
			});

			const tableRows: RecipientTableViewRow[] = recipients.map((recipient) => {
				const access = accessiblePrograms.find((p) => p.programId === recipient.program?.id);
				const payoutsReceived = recipient.payouts.length;
				const payoutsTotal = recipient.program?.totalPayments ?? 0;
				const payoutsProgressPercent = payoutsTotal > 0 ? Math.round((payoutsReceived / payoutsTotal) * 100) : 0;

				return {
					id: recipient.id,
					firstName: recipient.contact?.firstName ?? '',
					lastName: recipient.contact?.lastName ?? '',
					dateOfBirth: recipient.contact?.dateOfBirth ?? null,
					localPartnerName: recipient.localPartner?.name ?? null,
					status: recipient.status ?? RecipientStatus.active,
					programId: recipient.program?.id ?? null,
					programName: recipient.program?.name ?? null,
					payoutsReceived,
					payoutsTotal,
					payoutsProgressPercent,
					createdAt: recipient.createdAt,
					permission: access?.permission ?? ProgramPermission.readonly,
				};
			});

			return this.resultOk({ tableRows });
		} catch {
			return this.resultFail('Could not fetch recipients');
		}
	}

	async getTableViewProgramScoped(userId: string, programId: string): Promise<ServiceResult<RecipientTableView>> {
		const base = await this.getTableView(userId);
		if (!base.success) {
			return base;
		}

		const filteredRows = base.data.tableRows.filter((row) => row.programId === programId);
		return this.resultOk({ tableRows: filteredRows });
	}
}

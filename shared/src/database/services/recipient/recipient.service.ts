import { PayoutStatus, ProgramPermission } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { RecipientTableView, RecipientTableViewRow } from './recipient.types';

export class RecipientService extends BaseService {
	async getRecipientTableView(userId: string): Promise<ServiceResult<RecipientTableView>> {
		const authResult = await this.requireUser(userId);
		if (!authResult.success) {
			return this.resultFail(authResult.error, authResult.status);
		}

		try {
			const recipients = await this.db.recipient.findMany({
				where: {
					program: {
						accesses: {
							some: { userId },
						},
					},
				},
				orderBy: { createdAt: 'desc' },
				select: {
					id: true,
					status: true,
					program: {
						select: {
							id: true,
							name: true,
							totalPayments: true,
							accesses: {
								where: { userId },
								select: { permissions: true },
							},
						},
					},
					localPartner: {
						select: {
							name: true,
							contact: {
								select: {
									firstName: true,
									lastName: true,
								},
							},
						},
					},
					contact: {
						select: {
							firstName: true,
							lastName: true,
							dateOfBirth: true,
						},
					},
					payouts: {
						where: { status: { in: [PayoutStatus.paid, PayoutStatus.confirmed] } },
						select: { id: true },
					},
				},
			});

			const tableRows: RecipientTableViewRow[] = recipients.map((r) => {
				const payoutsReceived = r.payouts.length;
				const payoutsTotal = r.program?.totalPayments ?? 0;
				const payoutsProgressPercent = payoutsTotal > 0 ? Math.round((payoutsReceived / payoutsTotal) * 100) : 0;

				const birthDate = r.contact?.dateOfBirth ?? null;
				const age = birthDate ? this.calculateAgeFromBirthDate(birthDate) : null;

				const permissions = r.program?.accesses[0]?.permissions ?? [];
				const permission: ProgramPermission = permissions.includes(ProgramPermission.edit)
					? ProgramPermission.edit
					: ProgramPermission.readonly;

				const localPartnerName =
					r.localPartner?.name ??
					(r.localPartner?.contact ? `${r.localPartner.contact.firstName} ${r.localPartner.contact.lastName}` : '');

				return {
					id: r.id,
					firstName: r.contact?.firstName ?? '',
					lastName: r.contact?.lastName ?? '',
					age,
					status: r.status,
					payoutsReceived,
					payoutsTotal,
					payoutsProgressPercent,
					localPartnerName,
					programName: r.program?.name ?? '',
					programId: r.program?.id ?? '',
					permission,
				};
			});

			return this.resultOk({ tableRows });
		} catch {
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
		const monthDiff = today.getMonth() - birthDate.getMonth();
		const dayDiff = today.getDate() - birthDate.getDate();
		if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) years -= 1;
		return years;
	}
}

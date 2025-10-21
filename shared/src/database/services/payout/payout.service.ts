import { Gender, PayoutStatus, ProgramPermission } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import {
	OngoingPayoutTableView,
	OngoingPayoutTableViewRow,
	PayoutConfirmationTableView,
	PayoutConfirmationTableViewRow,
	PayoutMonth,
} from './payout.types';

export class PayoutService extends BaseService {
	async getOngoingPayoutTableView(userId: string): Promise<ServiceResult<OngoingPayoutTableView>> {
		const authResult = await this.requireUser(userId);
		if (!authResult.success) {
			return this.resultFail(authResult.error, authResult.status);
		}

		try {
			const { fromMonthStart, months } = this.getLastThreeMonths();

			const recipients = await this.db.recipient.findMany({
				where: {
					program: { accesses: { some: { userId } } },
				},
				select: {
					id: true,
					contact: { select: { firstName: true, lastName: true, gender: true } },
					program: {
						select: {
							name: true,
							totalPayments: true,
							accesses: { where: { userId }, select: { permissions: true } },
						},
					},
					payouts: {
						where: {
							OR: [
								{ status: { in: [PayoutStatus.paid, PayoutStatus.confirmed] } },
								{ paymentAt: { gte: fromMonthStart } },
							],
						},
						select: { status: true, paymentAt: true },
						orderBy: { paymentAt: 'desc' },
					},
				},
				orderBy: { createdAt: 'desc' },
			});

			const tableRows: OngoingPayoutTableViewRow[] = recipients.map((recipient) => {
				const payoutsTotal = recipient.program?.totalPayments ?? 0;

				let payoutsReceived = 0;
				for (const p of recipient.payouts) {
					if (p.status === PayoutStatus.paid || p.status === PayoutStatus.confirmed) {
						payoutsReceived += 1;
					}
				}

				const payoutsProgressPercent = payoutsTotal > 0 ? Math.round((payoutsReceived / payoutsTotal) * 100) : 0;

				const paymentsLeft = Math.max(payoutsTotal - payoutsReceived, 0);

				const last3Months: PayoutMonth[] = [];
				for (const m of months) {
					const payout = recipient.payouts.find((p) => p.paymentAt >= m.start && p.paymentAt < m.end);
					last3Months.push({
						monthLabel: m.monthLabel,
						status: payout?.status ?? PayoutStatus.created,
					});
				}

				const permissions = recipient.program?.accesses[0]?.permissions ?? [];
				const permission: ProgramPermission = permissions.includes('edit')
					? ProgramPermission.edit
					: ProgramPermission.readonly;

				const gender: Gender = (recipient.contact?.gender ?? 'private') as Gender;

				return {
					id: recipient.id,
					firstName: recipient.contact?.firstName ?? '',
					lastName: recipient.contact?.lastName ?? '',
					gender,
					programName: recipient.program?.name ?? '',
					payoutsReceived,
					payoutsTotal,
					payoutsProgressPercent,
					paymentsLeft,
					last3Months,
					permission,
				};
			});

			return this.resultOk({ tableRows });
		} catch {
			return this.resultFail('Could not fetch payouts');
		}
	}

	async getPayoutConfirmationTableView(userId: string): Promise<ServiceResult<PayoutConfirmationTableView>> {
		const authResult = await this.requireUser(userId);
		if (!authResult.success) {
			return this.resultFail(authResult.error, authResult.status);
		}

		try {
			const payouts = await this.db.payout.findMany({
				where: {
					recipient: {
						program: { accesses: { some: { userId } } },
					},
				},
				select: {
					id: true,
					paymentAt: true,
					status: true,
					recipient: {
						select: {
							contact: { select: { firstName: true, lastName: true } },
							program: {
								select: {
									name: true,
									accesses: { where: { userId }, select: { permissions: true } },
								},
							},
						},
					},
				},
				orderBy: { paymentAt: 'desc' },
			});

			const tableRows: PayoutConfirmationTableViewRow[] = payouts.map((p) => {
				const program = p.recipient?.program;
				const permissions = program?.accesses[0]?.permissions ?? [];
				const permission: ProgramPermission = permissions.includes('edit')
					? ProgramPermission.edit
					: ProgramPermission.readonly;

				return {
					id: p.id,
					firstName: p.recipient?.contact?.firstName ?? '',
					lastName: p.recipient?.contact?.lastName ?? '',
					paymentAt: p.paymentAt,
					paymentAtFormatted: new Intl.DateTimeFormat('de-CH').format(p.paymentAt),
					status: p.status,
					programName: program?.name ?? '',
					permission,
				};
			});

			return this.resultOk({ tableRows });
		} catch {
			return this.resultFail('Could not fetch payout confirmations');
		}
	}

	private getLastThreeMonths() {
		const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);
		const addMonths = (date: Date, diff: number) => new Date(date.getFullYear(), date.getMonth() + diff, 1);
		const formatMonthLabel = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

		const currentMonth = startOfMonth(new Date());
		const previousMonth = addMonths(currentMonth, -1);
		const twoMonthsAgo = addMonths(currentMonth, -2);

		const months = [
			{ monthLabel: formatMonthLabel(currentMonth), start: currentMonth, end: addMonths(currentMonth, 1) },
			{ monthLabel: formatMonthLabel(previousMonth), start: previousMonth, end: addMonths(previousMonth, 1) },
			{ monthLabel: formatMonthLabel(twoMonthsAgo), start: twoMonthsAgo, end: addMonths(twoMonthsAgo, 1) },
		];

		return { fromMonthStart: months[2].start, months };
	}
}

import { PayoutStatus, RecipientStatus } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { PayoutTableView, PayoutTableViewRow, ProgramPermission } from './payout.types';

export class PayoutService extends BaseService {
	async getPayoutTableViewForUser(userId: string): Promise<ServiceResult<PayoutTableView>> {
		try {
			const { fromMonthStart, months } = this.getLastThreeMonths();

			const recipients = await this.db.recipient.findMany({
				where: {
					program: this.userAccessibleProgramsWhere(userId),
					status: { in: [RecipientStatus.active, RecipientStatus.designated] },
				},
				select: {
					id: true,
					user: { select: { firstName: true, lastName: true, gender: true } },
					program: {
						select: {
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

			const tableRows: PayoutTableViewRow[] = recipients.map((r) => {
				const payoutsTotal = r.program?.totalPayments ?? 0;
				const payoutsReceived = r.payouts.filter((p) => p.status === 'paid' || p.status === 'confirmed').length;

				const payoutsProgressPercent = payoutsTotal > 0 ? Math.round((payoutsReceived / payoutsTotal) * 100) : 0;

				const paymentsLeft = Math.max(payoutsTotal - payoutsReceived, 0);

				const last3Months = months.map(({ ym, start, end }) => {
					const m = r.payouts.find((p) => p.paymentAt >= start && p.paymentAt < end);
					return {
						ym,
						status: m?.status ?? PayoutStatus.created,
					};
				});
				const isOperator = (r.program?.operatorOrganization?.users?.length ?? 0) > 0;
				const permission: ProgramPermission = isOperator ? 'operator' : 'viewer';

				return {
					id: r.id,
					firstName: r.user?.firstName ?? '',
					lastName: r.user?.lastName ?? '',
					gender: (r.user?.gender ?? 'private') as any,
					programName: r.program?.name ?? '',
					payoutsReceived,
					payoutsTotal,
					payoutsProgressPercent,
					paymentsLeft,
					last3Months,
					permission,
				};
			});

			return this.resultOk({ tableRows });
		} catch (e) {
			console.error('[PayoutService.getPayoutTableViewForUser]', e);
			return this.resultFail('Could not fetch payouts');
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

	private getLastThreeMonths() {
		const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
		const addMonths = (d: Date, diff: number) => new Date(d.getFullYear(), d.getMonth() + diff, 1);
		const ym = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

		const now = new Date();
		const m0 = startOfMonth(now);
		const m1 = addMonths(m0, -1);
		const m2 = addMonths(m0, -2);

		const months = [
			{ ym: ym(m0), start: m0, end: addMonths(m0, 1) },
			{ ym: ym(m1), start: m1, end: addMonths(m1, 1) },
			{ ym: ym(m2), start: m2, end: addMonths(m2, 1) },
		];

		return { fromMonthStart: months[2].start, months };
	}
}

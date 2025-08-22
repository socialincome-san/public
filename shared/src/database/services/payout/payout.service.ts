import { PayoutStatus, RecipientStatus } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { PayoutTableView, PayoutTableViewRow, ProgramPermission } from './payout.types';

export class PayoutService extends BaseService {
	async getPayoutTableView(userId: string): Promise<ServiceResult<PayoutTableView>> {
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

			const tableRows: PayoutTableViewRow[] = recipients.map((recipient) => {
				const payoutsTotal = recipient.program?.totalPayments ?? 0;
				const payoutsReceived = recipient.payouts.filter(
					(payout) => payout.status === 'paid' || payout.status === 'confirmed',
				).length;

				const payoutsProgressPercent = payoutsTotal > 0 ? Math.round((payoutsReceived / payoutsTotal) * 100) : 0;

				const paymentsLeft = Math.max(payoutsTotal - payoutsReceived, 0);

				const last3Months = months.map(({ monthLabel, start, end }) => {
					const payout = recipient.payouts.find((p) => p.paymentAt >= start && p.paymentAt < end);
					return {
						monthLabel,
						status: payout?.status ?? PayoutStatus.created,
					};
				});

				const isOperator = (recipient.program?.operatorOrganization?.users?.length ?? 0) > 0;
				const permission: ProgramPermission = isOperator ? 'operator' : 'viewer';

				return {
					id: recipient.id,
					firstName: recipient.user?.firstName ?? '',
					lastName: recipient.user?.lastName ?? '',
					gender: (recipient.user?.gender ?? 'private') as any,
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
		} catch (error) {
			console.error('[PayoutService.getPayoutTableView]', error);
			return this.resultFail('Could not fetch payouts');
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
			{
				monthLabel: formatMonthLabel(currentMonth),
				start: currentMonth,
				end: addMonths(currentMonth, 1),
			},
			{
				monthLabel: formatMonthLabel(previousMonth),
				start: previousMonth,
				end: addMonths(previousMonth, 1),
			},
			{
				monthLabel: formatMonthLabel(twoMonthsAgo),
				start: twoMonthsAgo,
				end: addMonths(twoMonthsAgo, 1),
			},
		];

		return { fromMonthStart: months[2].start, months };
	}
}

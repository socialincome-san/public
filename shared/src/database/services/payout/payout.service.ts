import { PayoutStatus, ProgramPermission } from '@prisma/client';
import { addMonths, endOfMonth, format, startOfMonth, subMonths } from 'date-fns';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { ExchangeRateService } from '../exchange-rate/exchange-rate.service';
import { ProgramAccessService } from '../program-access/program-access.service';
import {
	OngoingPayoutTableView,
	OngoingPayoutTableViewRow,
	PayoutForecastTableView,
	PayoutForecastTableViewRow,
	PayoutMonth,
	PayoutTableView,
	PayoutTableViewRow,
} from './payout.types';

export class PayoutService extends BaseService {
	private programAccessService = new ProgramAccessService();
	private exchangeRateService = new ExchangeRateService();

	async getTableView(userId: string): Promise<ServiceResult<PayoutTableView>> {
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

			const payouts = await this.db.payout.findMany({
				where: { recipient: { programId: { in: programIds } } },
				select: {
					id: true,
					amount: true,
					currency: true,
					status: true,
					paymentAt: true,
					recipient: {
						select: {
							contact: { select: { firstName: true, lastName: true } },
							program: { select: { id: true, name: true } },
						},
					},
				},
				orderBy: { paymentAt: 'desc' },
			});

			const tableRows: PayoutTableViewRow[] = payouts.map((payout) => {
				const program = accessiblePrograms.find((x) => x.programId === payout.recipient.program.id);
				const permission = program?.permission ?? ProgramPermission.readonly;

				return {
					id: payout.id,
					recipientFirstName: payout.recipient.contact.firstName,
					recipientLastName: payout.recipient.contact.lastName,
					programName: payout.recipient.program.name,
					amount: Number(payout.amount),
					currency: payout.currency,
					status: payout.status,
					paymentAt: payout.paymentAt,
					permission,
				};
			});

			return this.resultOk({ tableRows });
		} catch (error) {
			console.error(error);
			return this.resultFail('Could not fetch payouts');
		}
	}

	async getOngoingPayoutTableView(userId: string): Promise<ServiceResult<OngoingPayoutTableView>> {
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
			const months = this.getMonthIntervals();

			const recipients = await this.db.recipient.findMany({
				where: { programId: { in: programIds } },
				select: {
					id: true,
					contact: { select: { firstName: true, lastName: true } },
					program: { select: { id: true, name: true, totalPayments: true } },
					payouts: { select: { status: true, paymentAt: true } },
					createdAt: true,
				},
			});

			const tableRows: OngoingPayoutTableViewRow[] = recipients.map((recipient) => {
				const access = accessiblePrograms.find((p) => p.programId === recipient.program.id);
				const permission = access?.permission ?? ProgramPermission.readonly;

				const payoutsReceived = recipient.payouts.length;
				const payoutsTotal = recipient.program.totalPayments ?? 0;
				const payoutsProgressPercent = payoutsTotal > 0 ? Math.round((payoutsReceived / payoutsTotal) * 100) : 0;

				const last3Months: PayoutMonth[] = [months.current, months.last, months.twoAgo].map(({ start, end }) => {
					const payout = recipient.payouts.find((p) => p.paymentAt >= start && p.paymentAt <= end);
					return {
						monthLabel: format(start, 'yyyy-MM'),
						status: payout?.status ?? null,
					};
				});

				return {
					id: recipient.id,
					firstName: recipient.contact.firstName,
					lastName: recipient.contact.lastName,
					programName: recipient.program.name,
					payoutsReceived,
					payoutsTotal,
					payoutsProgressPercent,
					last3Months,
					createdAt: recipient.createdAt,
					permission,
				};
			});

			return this.resultOk({ tableRows });
		} catch (error) {
			console.error(error);
			return this.resultFail('Could not fetch ongoing payouts');
		}
	}

	async getForecastTableView(
		userId: string,
		programId: string,
		monthsAhead: number,
	): Promise<ServiceResult<PayoutForecastTableView>> {
		try {
			const accessResult = await this.programAccessService.getAccessiblePrograms(userId);
			if (!accessResult.success) {
				return this.resultFail(accessResult.error);
			}

			const hasAccess = accessResult.data.some((p) => p.programId === programId);
			if (!hasAccess) {
				return this.resultFail('Access denied for this program');
			}

			const program = await this.db.program.findUnique({
				where: { id: programId },
				select: {
					totalPayments: true,
					payoutAmount: true,
					payoutCurrency: true,
					recipients: {
						select: {
							payouts: {
								where: { status: { in: [PayoutStatus.paid, PayoutStatus.confirmed] } },
								select: { id: true },
							},
						},
					},
				},
			});

			if (!program) {
				return this.resultFail('Program not found');
			}

			const forecastMonths = Array.from({ length: monthsAhead }, (_, i) => {
				const start = startOfMonth(addMonths(new Date(), i + 1));
				return format(start, 'yyyy-MM');
			});

			const recipientCountByMonth = new Map<string, number>();
			for (const m of forecastMonths) {
				recipientCountByMonth.set(m, 0);
			}

			for (const recipient of program.recipients) {
				const paid = recipient.payouts.length;
				const remaining = Math.max(0, program.totalPayments - paid);
				for (let i = 0; i < remaining && i < monthsAhead; i++) {
					const monthLabel = forecastMonths[i];
					recipientCountByMonth.set(monthLabel, (recipientCountByMonth.get(monthLabel) ?? 0) + 1);
				}
			}

			const exchangeRateResult = await this.exchangeRateService.getLatestRates();
			if (!exchangeRateResult.success) {
				return this.resultFail(exchangeRateResult.error);
			}

			const baseRate = exchangeRateResult.data[program.payoutCurrency];
			const usdRate = exchangeRateResult.data.USD;

			if (!baseRate || !usdRate) {
				return this.resultFail('Missing exchange rate');
			}

			const payoutAmountUsd = (Number(program.payoutAmount) / baseRate) * usdRate;

			const tableRows: PayoutForecastTableViewRow[] = forecastMonths.map((label) => {
				const count = recipientCountByMonth.get(label) ?? 0;

				return {
					period: label,
					numberOfRecipients: count,
					amountInProgramCurrency: Number(program.payoutAmount) * count,
					amountUsd: payoutAmountUsd * count,
					programCurrency: program.payoutCurrency,
				};
			});

			return this.resultOk({ tableRows });
		} catch (error) {
			console.error(error);
			return this.resultFail('Could not generate payout forecast');
		}
	}

	private getMonthIntervals() {
		const now = new Date();

		return {
			current: { start: startOfMonth(now), end: endOfMonth(now) },
			last: { start: startOfMonth(subMonths(now, 1)), end: endOfMonth(subMonths(now, 1)) },
			twoAgo: { start: startOfMonth(subMonths(now, 2)), end: endOfMonth(subMonths(now, 2)) },
		};
	}
}

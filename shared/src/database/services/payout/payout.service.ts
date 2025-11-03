import { PayoutStatus, Prisma, ProgramPermission, RecipientStatus } from '@prisma/client';
import { addMonths, endOfMonth, format, isSameMonth, startOfMonth, subMonths } from 'date-fns';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { ExchangeRateService } from '../exchange-rate/exchange-rate.service';
import { ProgramAccessService } from '../program-access/program-access.service';
import { RecipientService } from '../recipient/recipient.service';
import {
	OngoingPayoutTableView,
	OngoingPayoutTableViewRow,
	PayoutConfirmationTableView,
	PayoutConfirmationTableViewRow,
	PayoutForecastTableView,
	PayoutForecastTableViewRow,
	PayoutMonth,
	PayoutTableView,
	PayoutTableViewRow,
	PreviewPayout,
	RecipientCompletionPreview,
	YearMonth,
} from './payout.types';

export class PayoutService extends BaseService {
	private programAccessService = new ProgramAccessService();
	private exchangeRateService = new ExchangeRateService();
	private recipientService = new RecipientService();

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

	async getPayoutConfirmationTableView(userId: string): Promise<ServiceResult<PayoutConfirmationTableView>> {
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
				where: {
					status: PayoutStatus.paid,
					recipient: { programId: { in: programIds } },
				},
				select: {
					id: true,
					amount: true,
					currency: true,
					status: true,
					paymentAt: true,
					phoneNumber: true,
					recipient: {
						select: {
							contact: { select: { firstName: true, lastName: true } },
							program: { select: { id: true, name: true } },
						},
					},
				},
				orderBy: { paymentAt: 'desc' },
			});

			const tableRows: PayoutConfirmationTableViewRow[] = payouts.map((payout) => {
				const access = accessiblePrograms.find((x) => x.programId === payout.recipient.program.id);
				const permission = access?.permission ?? ProgramPermission.readonly;

				return {
					id: payout.id,
					recipientFirstName: payout.recipient.contact.firstName,
					recipientLastName: payout.recipient.contact.lastName,
					programName: payout.recipient.program.name,
					amount: Number(payout.amount),
					currency: payout.currency,
					status: payout.status,
					paymentAt: payout.paymentAt,
					phoneNumber: payout.phoneNumber,
					permission,
				};
			});

			return this.resultOk({ tableRows });
		} catch (error) {
			console.error(error);
			return this.resultFail('Could not fetch payout confirmation inbox');
		}
	}

	async confirmPayout(userId: string, payoutId: string): Promise<ServiceResult<string>> {
		try {
			const accessResult = await this.programAccessService.getAccessiblePrograms(userId);
			if (!accessResult.success) {
				return this.resultFail(accessResult.error);
			}

			const payout = await this.db.payout.findUnique({
				where: { id: payoutId },
				select: {
					id: true,
					status: true,
					recipient: { select: { programId: true } },
				},
			});

			if (!payout) {
				return this.resultFail('Payout not found');
			}

			const hasAccess = accessResult.data.some((p) => p.programId === payout.recipient.programId);
			if (!hasAccess) {
				return this.resultFail('Access denied for this payout');
			}

			if (payout.status !== PayoutStatus.paid) {
				return this.resultFail('Only payouts with status "paid" can be confirmed');
			}

			await this.db.payout.update({
				where: { id: payoutId },
				data: { status: PayoutStatus.confirmed },
			});

			return this.resultOk('Payout confirmed successfully');
		} catch (error) {
			console.error(error);
			return this.resultFail('Could not confirm payout');
		}
	}

	async contestPayout(userId: string, payoutId: string): Promise<ServiceResult<string>> {
		try {
			const accessResult = await this.programAccessService.getAccessiblePrograms(userId);
			if (!accessResult.success) {
				return this.resultFail(accessResult.error);
			}

			const payout = await this.db.payout.findUnique({
				where: { id: payoutId },
				select: {
					id: true,
					status: true,
					recipient: { select: { programId: true } },
				},
			});

			if (!payout) {
				return this.resultFail('Payout not found');
			}

			const hasAccess = accessResult.data.some((p) => p.programId === payout.recipient.programId);
			if (!hasAccess) {
				return this.resultFail('Access denied for this payout');
			}

			if (payout.status !== PayoutStatus.paid) {
				return this.resultFail('Only payouts with status "paid" can be contested');
			}

			await this.db.payout.update({
				where: { id: payoutId },
				data: { status: PayoutStatus.contested },
			});

			return this.resultOk('Payout marked as contested');
		} catch (error) {
			console.error(error);
			return this.resultFail('Could not contest payout');
		}
	}

	async downloadRegistrationCSV(userId: string): Promise<ServiceResult<string>> {
		try {
			const recipientsResult = await this.recipientService.getActivePayoutRecipients(userId);
			if (!recipientsResult.success) {
				return this.resultFail(recipientsResult.error);
			}

			const recipients = recipientsResult.data;
			const csvRows: string[][] = [['Mobile Number*', 'Unique Code*', 'User Type*']];

			for (const recipient of recipients) {
				const code = recipient.paymentInformation?.code;
				const phone = recipient.paymentInformation?.phone?.number;
				if (!code || !phone) {
					return this.resultFail(`Orange Money Id or phone number missing for recipient: ${recipient.id}`);
				}
				csvRows.push([phone.toString().slice(-8), code.toString(), 'subscriber']);
			}

			return this.resultOk(csvRows.map((row) => row.join(',')).join('\n'));
		} catch (error) {
			console.error(error);
			return this.resultFail('Could not generate registration CSV');
		}
	}

	async downloadPayoutCSV(userId: string, target: YearMonth): Promise<ServiceResult<string>> {
		try {
			const recipientsResult = await this.recipientService.getActivePayoutRecipients(userId);
			if (!recipientsResult.success) {
				return this.resultFail(recipientsResult.error);
			}

			const recipients = recipientsResult.data;
			const targetDate = new Date(target.year, target.month - 1);
			const monthLabel = format(targetDate, 'MMMM yyyy');

			const csvRows: string[][] = [
				['Mobile Number*', 'Amount*', 'First Name', 'Last Name', 'Id Number', 'Remarks*', 'User Type*'],
			];

			for (const recipient of recipients) {
				const code = recipient.paymentInformation?.code;
				const phone = recipient.paymentInformation?.phone?.number;
				const firstName = recipient.contact?.firstName ?? '';
				const lastName = recipient.contact?.lastName ?? '';
				const amount = Number(recipient.program?.payoutAmount ?? 0);

				if (!code || !phone) {
					return this.resultFail(`Orange Money Id or phone number missing for recipient: ${recipient.id}`);
				}

				csvRows.push([
					phone.toString().slice(-8),
					amount.toString(),
					firstName,
					lastName,
					code.toString(),
					`Social Income ${monthLabel}`,
					'subscriber',
				]);
			}

			return this.resultOk(csvRows.map((row) => row.join(',')).join('\n'));
		} catch (error) {
			console.error(error);
			return this.resultFail('Could not generate payout CSV');
		}
	}

	async previewCurrentMonthPayouts(userId: string, target: YearMonth): Promise<ServiceResult<PreviewPayout[]>> {
		try {
			const recipientsResult = await this.recipientService.getActivePayoutRecipients(userId);
			if (!recipientsResult.success) {
				return this.resultFail(recipientsResult.error);
			}

			const recipients = recipientsResult.data;
			if (recipients.length === 0) {
				return this.resultOk([]);
			}

			const exchangeRateResult = await this.exchangeRateService.getLatestRates();
			if (!exchangeRateResult.success) {
				return this.resultFail(exchangeRateResult.error);
			}

			const rates = exchangeRateResult.data;
			const currentMonth = startOfMonth(new Date(target.year, target.month - 1));

			const toCreate: PreviewPayout[] = recipients
				.filter((r) => !r.payouts.some((p) => isSameMonth(p.paymentAt, currentMonth)))
				.map((r) => {
					const payoutAmount = r.program.payoutAmount;
					const currency = r.program.payoutCurrency;
					const rateCurrency = rates[currency];
					const rateChf = rates['CHF'];
					const amountChf = rateCurrency && rateChf ? (payoutAmount / rateCurrency) * rateChf : null;
					const phoneNumber = r.paymentInformation?.phone?.number ?? null;

					return {
						recipientId: r.id,
						firstName: r.contact.firstName,
						lastName: r.contact.lastName,
						phoneNumber,
						currency,
						amount: payoutAmount,
						amountChf,
						paymentAt: currentMonth,
						status: PayoutStatus.paid,
					};
				});

			return this.resultOk(toCreate);
		} catch (error) {
			console.error(error);
			return this.resultFail('Could not preview payouts');
		}
	}

	async generateCurrentMonthPayouts(userId: string, target: YearMonth): Promise<ServiceResult<string>> {
		try {
			const previewResult = await this.previewCurrentMonthPayouts(userId, target);
			if (!previewResult.success) {
				return this.resultFail(previewResult.error);
			}

			const toCreate = previewResult.data;
			if (toCreate.length === 0) {
				return this.resultOk('No payouts to create for this month');
			}

			const dbPayload: Prisma.PayoutCreateManyInput[] = toCreate.map((p) => ({
				recipientId: p.recipientId,
				amount: p.amount,
				amountChf: p.amountChf ?? null,
				currency: p.currency,
				paymentAt: p.paymentAt,
				status: p.status,
				phoneNumber: p.phoneNumber ?? null,
				comments: null,
			}));

			await this.db.payout.createMany({ data: dbPayload });

			return this.resultOk(
				`Created ${dbPayload.length} payouts for ${target.year}-${String(target.month).padStart(2, '0')}.`,
			);
		} catch (error) {
			console.error(error);
			return this.resultFail('Could not generate payouts');
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

	async previewCompletedRecipients(userId: string): Promise<ServiceResult<RecipientCompletionPreview[]>> {
		try {
			const recipientsResult = await this.recipientService.getActivePayoutRecipients(userId);

			if (!recipientsResult.success) {
				return this.resultFail(recipientsResult.error);
			}

			const recipients = recipientsResult.data;
			if (recipients.length === 0) {
				return this.resultOk([]);
			}

			const completed: RecipientCompletionPreview[] = recipients
				.map((r) => {
					const paidCount = r.payouts.filter((p) =>
						([PayoutStatus.paid, PayoutStatus.confirmed] as PayoutStatus[]).includes(p.status),
					).length;
					const remaining = r.program.totalPayments - paidCount;

					return {
						id: r.id,
						firstName: r.contact.firstName,
						lastName: r.contact.lastName,
						paidCount,
						totalPayments: r.program.totalPayments,
						remaining,
						isCompleted: remaining <= 0,
					};
				})
				.filter((r) => r.isCompleted);

			return this.resultOk(completed);
		} catch (error) {
			console.error(error);
			return this.resultFail('Could not preview completed recipients');
		}
	}

	async markCompletedRecipientsAsFormer(userId: string): Promise<ServiceResult<string>> {
		try {
			const previewResult = await this.previewCompletedRecipients(userId);

			if (!previewResult.success) {
				return this.resultFail(previewResult.error);
			}

			const completed = previewResult.data;
			if (completed.length === 0) {
				return this.resultOk('No recipients to update');
			}

			const recipientIds = completed.map((r) => r.id);

			await this.db.recipient.updateMany({
				where: { id: { in: recipientIds } },
				data: { status: RecipientStatus.former },
			});

			return this.resultOk(`Updated ${completed.length} recipients to status "former".`);
		} catch (error) {
			console.error(error);
			return this.resultFail('Could not update recipients');
		}
	}
}

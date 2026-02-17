import { PayoutStatus, Prisma } from '@/generated/prisma/client';
import { format, isSameMonth, startOfMonth } from 'date-fns';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { ExchangeRateService } from '../exchange-rate/exchange-rate.service';
import { ProgramAccessService } from '../program-access/program-access.service';
import { ProgramService } from '../program/program.service';
import { PayoutRecipient, PreviewPayout } from './payout-process.types';

export class PayoutProcessService extends BaseService {
	private programAccessService = new ProgramAccessService();
	private programService = new ProgramService();
	private exchangeRateService = new ExchangeRateService();

	async getRecipientsReadyForPayout(userId: string): Promise<ServiceResult<PayoutRecipient[]>> {
		try {
			const accessResult = await this.programAccessService.getAccessiblePrograms(userId);

			if (!accessResult.success) {
				return this.resultFail(accessResult.error);
			}

			const accessiblePrograms = accessResult.data;
			if (accessiblePrograms.length === 0) {
				return this.resultFail('No accessible programs found');
			}

			const programIdsReadyForPayouts: string[] = [];

			for (const program of accessiblePrograms) {
				const result = await this.programService.isReadyForPayouts(program.programId);

				if (result.success && result.data === true) {
					programIdsReadyForPayouts.push(program.programId);
				}
			}

			const now = new Date();

			const recipients = await this.db.recipient.findMany({
				where: {
					programId: { in: programIdsReadyForPayouts },
					startDate: { lte: now },
					OR: [{ suspendedAt: null }, { suspendedAt: { gt: now } }],
				},
				select: {
					id: true,
					contact: {
						select: {
							firstName: true,
							lastName: true,
						},
					},
					paymentInformation: {
						select: {
							code: true,
							phone: { select: { number: true } },
						},
					},
					program: {
						select: {
							payoutPerInterval: true,
							payoutCurrency: true,
							programDurationInMonths: true,
							payoutInterval: true,
						},
					},
					payouts: {
						select: {
							paymentAt: true,
							status: true,
						},
					},
				},
				orderBy: {
					paymentInformation: { code: 'asc' },
				},
			});

			const mapped: PayoutRecipient[] = recipients
				.filter((recipient) => recipient.program !== null)
				.filter((recipient) => {
					const program = recipient.program!;

					const paidCount = recipient.payouts.filter(
						(p) => p.status === PayoutStatus.paid || p.status === PayoutStatus.confirmed,
					).length;

					let intervalInMonths = 1;

					if (program.payoutInterval === 'quarterly') {
						intervalInMonths = 3;
					}

					if (program.payoutInterval === 'yearly') {
						intervalInMonths = 12;
					}

					const expectedPayouts = Math.ceil(program.programDurationInMonths / intervalInMonths);

					return paidCount < expectedPayouts;
				})
				.map((recipient) => ({
					id: recipient.id,
					contact: recipient.contact,
					paymentInformation: recipient.paymentInformation,
					program: {
						payoutPerInterval: Number(recipient.program!.payoutPerInterval),
						payoutCurrency: recipient.program!.payoutCurrency,
						programDurationInMonths: recipient.program!.programDurationInMonths,
					},
					payouts: recipient.payouts,
				}));

			return this.resultOk(mapped);
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not fetch payout recipients: ${JSON.stringify(error)}`);
		}
	}

	async generateRegistrationCSV(userId: string): Promise<ServiceResult<string>> {
		try {
			const recipientsResult = await this.getRecipientsReadyForPayout(userId);
			if (!recipientsResult.success) {
				return this.resultFail(recipientsResult.error);
			}

			const recipients = recipientsResult.data;
			const csvRows: string[][] = [['Mobile Number*', 'Unique Code*', 'User Type*']];

			for (const recipient of recipients) {
				const code = recipient.paymentInformation?.code ?? 'NO_CODE';
				const phone = recipient.paymentInformation?.phone?.number ?? 'NO_PHONE';
				csvRows.push([phone.toString().slice(-8), code.toString(), 'subscriber']);
			}

			return this.resultOk(csvRows.map((row) => row.join(',')).join('\n'));
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not generate registration CSV: ${JSON.stringify(error)}`);
		}
	}

	async generatePayoutCSV(userId: string, selectedDate: Date): Promise<ServiceResult<string>> {
		try {
			const recipientsResult = await this.getRecipientsReadyForPayout(userId);
			if (!recipientsResult.success) {
				return this.resultFail(recipientsResult.error);
			}

			const recipients = recipientsResult.data;
			const monthLabel = format(selectedDate, 'MMMM yyyy');

			const csvRows: string[][] = [
				['Mobile Number*', 'Amount*', 'First Name', 'Last Name', 'Id Number', 'Remarks*', 'User Type*'],
			];

			for (const recipient of recipients) {
				const code = recipient.paymentInformation?.code ?? 'NO_CODE';
				const phone = recipient.paymentInformation?.phone?.number ?? 'NO_PHONE';
				const firstName = recipient.contact?.firstName ?? '';
				const lastName = recipient.contact?.lastName ?? '';
				const amount = Number(recipient.program?.payoutPerInterval ?? 0);

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
			this.logger.error(error);
			return this.resultFail(`Could not generate payout CSV: ${JSON.stringify(error)}`);
		}
	}

	async previewCurrentMonthPayouts(userId: string, selectedDate: Date): Promise<ServiceResult<PreviewPayout[]>> {
		try {
			const recipientsResult = await this.getRecipientsReadyForPayout(userId);
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

			const toCreate: PreviewPayout[] = recipients
				.filter((r) => !r.payouts.some((p) => isSameMonth(p.paymentAt, startOfMonth(selectedDate))))
				.map((r) => {
					const payoutPerInterval = r.program.payoutPerInterval;
					const currency = r.program.payoutCurrency;
					const rateCurrency = rates[currency];
					const rateChf = rates['CHF'];
					const amountChf = rateCurrency && rateChf ? (payoutPerInterval / rateCurrency) * rateChf : null;
					const phoneNumber = r.paymentInformation?.phone?.number ?? 'NO_PHONE';

					return {
						recipientId: r.id,
						firstName: r.contact.firstName,
						lastName: r.contact.lastName,
						phoneNumber,
						currency,
						amount: payoutPerInterval,
						amountChf,
						paymentAt: selectedDate,
						status: PayoutStatus.paid,
					};
				});

			return this.resultOk(toCreate);
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not preview payouts: ${JSON.stringify(error)}`);
		}
	}

	async generateCurrentMonthPayouts(userId: string, selectedDate: Date): Promise<ServiceResult<string>> {
		try {
			const previewResult = await this.previewCurrentMonthPayouts(userId, selectedDate);
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
				phoneNumber: p.phoneNumber ?? 'NO_PHONE',
				comments: null,
			}));

			await this.db.payout.createMany({ data: dbPayload });

			return this.resultOk(`Created ${dbPayload.length} payouts for ${format(selectedDate, 'yyyy-MM')}.`);
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not generate payouts: ${JSON.stringify(error)}`);
		}
	}
}

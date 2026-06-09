import { PayoutStatus, Prisma, PrismaClient, ProgramPermission } from '@/generated/prisma/client';
import { logger } from '@/lib/utils/logger';
import { now } from '@/lib/utils/now';
import { endOfMonth, format, isSameMonth, startOfMonth } from 'date-fns';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { ExchangeRateReadService } from '../exchange-rate/exchange-rate-read.service';
import { ProgramAccessReadService } from '../program-access/program-access-read.service';
import { ProgramStatsService } from '../program-stats/program-stats.service';
import { RecipientStatusService } from '../recipient/recipient-status.service';
import { PayoutRecipient, PreviewPayout } from './payout-process.types';

export class PayoutProcessCoreService extends BaseService {
	constructor(
		db: PrismaClient,
		private readonly programAccessService: ProgramAccessReadService,
		private readonly programStatsService: ProgramStatsService,
		private readonly exchangeRateService: ExchangeRateReadService,
		private readonly recipientStatusService: RecipientStatusService,
		loggerInstance = logger,
	) {
		super(db, loggerInstance);
	}

	async getRecipientsReadyForPayout(
		userId: string,
		providerIds: string[],
		referenceDate: Date = now(),
	): Promise<ServiceResult<PayoutRecipient[]>> {
		try {
			const accessResult = await this.programAccessService.getAccessiblePrograms(userId);

			if (!accessResult.success) {
				return this.resultFail(accessResult.error);
			}

			const accessiblePrograms = accessResult.data.filter((program) => program.permission === ProgramPermission.operator);
			if (accessiblePrograms.length === 0) {
				return this.resultFail('No accessible programs found');
			}

			const programIdsReadyForFirstPayoutInterval: string[] = [];

			for (const program of accessiblePrograms) {
				const result = await this.programStatsService.isReadyForFirstPayoutInterval(program.programId);

				if (result.success && result.data === true) {
					programIdsReadyForFirstPayoutInterval.push(program.programId);
				}
			}

			const nowDate = referenceDate;

			const recipients = await this.db.recipient.findMany({
				where: {
					programId: { in: programIdsReadyForFirstPayoutInterval },
					paymentInformation: { mobileMoneyProviderId: { in: providerIds } },
				},
				select: {
					id: true,
					startDate: true,
					suspendedAt: true,
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
							mobileMoneyProvider: { select: { name: true } },
						},
					},
					program: {
						select: {
							payoutPerInterval: true,
							programDurationInMonths: true,
							payoutInterval: true,
							country: {
								select: {
									currency: true,
								},
							},
						},
					},
					payouts: {
						select: {
							paymentAt: true,
							status: true,
						},
					},
				},
				orderBy: [{ paymentInformation: { code: 'asc' } }, { id: 'asc' }],
			});

			const mapped: PayoutRecipient[] = recipients
				.filter((recipient) => recipient.program !== null)
				.filter((recipient) => {
					const program = recipient.program!;
					const paidCountResult = this.recipientStatusService.countPaidOrConfirmedPayouts(recipient.payouts);
					if (!paidCountResult.success) {
						return false;
					}
					const isEligibleResult = this.recipientStatusService.isRecipientEligibleForPayout({
						startDate: recipient.startDate,
						suspendedAt: recipient.suspendedAt,
						paidOrConfirmedCount: paidCountResult.data,
						programDurationInMonths: program.programDurationInMonths,
						payoutInterval: program.payoutInterval,
						nowDate,
					});
					if (!isEligibleResult.success) {
						return false;
					}

					return isEligibleResult.data;
				})
				.map((recipient) => ({
					id: recipient.id,
					contact: recipient.contact,
					paymentInformation: recipient.paymentInformation,
					program: {
						payoutPerInterval: Number(recipient.program!.payoutPerInterval),
						payoutCurrency: recipient.program!.country.currency,
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

	countCurrentMonthPayouts(recipients: PayoutRecipient[], selectedDate: Date): number {
		const monthStart = startOfMonth(selectedDate);

		return recipients.filter((recipient) => !recipient.payouts.some((payout) => isSameMonth(payout.paymentAt, monthStart)))
			.length;
	}

	async previewCurrentMonthPayouts(
		recipients: PayoutRecipient[],
		selectedDate: Date,
	): Promise<ServiceResult<PreviewPayout[]>> {
		try {
			if (recipients.length === 0) {
				return this.resultOk([]);
			}

			const exchangeRateResult = await this.exchangeRateService.getLatestRates();
			if (!exchangeRateResult.success) {
				return this.resultFail(exchangeRateResult.error);
			}

			const rates = exchangeRateResult.data;
			const monthStart = startOfMonth(selectedDate);

			const toCreate: PreviewPayout[] = recipients
				.filter((recipient) => !recipient.payouts.some((payout) => isSameMonth(payout.paymentAt, monthStart)))
				.map((recipient) => {
					const payoutPerInterval = recipient.program.payoutPerInterval;
					const currency = recipient.program.payoutCurrency;
					const rateCurrency = rates[currency];
					const rateChf = rates.CHF;
					const amountChf = rateCurrency && rateChf ? (payoutPerInterval / rateCurrency) * rateChf : null;
					const phoneNumber = recipient.paymentInformation?.phone?.number ?? 'NO_PHONE';

					return {
						recipientId: recipient.id,
						firstName: recipient.contact.firstName,
						lastName: recipient.contact.lastName,
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

	async generateCurrentMonthPayouts(previewPayouts: PreviewPayout[], selectedDate: Date): Promise<ServiceResult<string>> {
		try {
			if (previewPayouts.length === 0) {
				return this.resultOk('No payouts to create for this month');
			}

			const monthStart = startOfMonth(selectedDate);
			const monthEnd = endOfMonth(selectedDate);
			const recipientIds = previewPayouts.map((payout) => payout.recipientId);

			const existingPayouts = await this.db.payout.findMany({
				where: {
					recipientId: { in: recipientIds },
					paymentAt: { gte: monthStart, lte: monthEnd },
				},
				select: { recipientId: true },
			});

			const alreadyPaidRecipientIds = new Set(existingPayouts.map((payout) => payout.recipientId));
			const toCreate = previewPayouts.filter((payout) => !alreadyPaidRecipientIds.has(payout.recipientId));

			if (toCreate.length === 0) {
				return this.resultOk(`No new payouts to create for ${format(selectedDate, 'yyyy-MM')}.`);
			}

			const dbPayload: Prisma.PayoutCreateManyInput[] = toCreate.map((payout) => ({
				recipientId: payout.recipientId,
				amount: payout.amount,
				amountChf: payout.amountChf ?? null,
				currency: payout.currency,
				paymentAt: payout.paymentAt,
				status: payout.status,
				phoneNumber: payout.phoneNumber ?? null,
				comments: null,
			}));

			await this.db.payout.createMany({ data: dbPayload });

			const skippedCount = previewPayouts.length - toCreate.length;
			const monthLabel = format(selectedDate, 'yyyy-MM');
			const message =
				skippedCount > 0
					? `Created ${dbPayload.length} payouts for ${monthLabel} (${skippedCount} already existed).`
					: `Created ${dbPayload.length} payouts for ${monthLabel}.`;

			return this.resultOk(message);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not generate payouts: ${JSON.stringify(error)}`);
		}
	}
}

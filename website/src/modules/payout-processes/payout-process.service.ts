import { CountryCode, PayoutProcess, PayoutStatus, ProgramPermission } from '@/generated/prisma/enums';
import { resultFail, resultOk, type ServiceResult } from '@/lib/service-result';
import { stringifyCsvLines } from '@/lib/utils/csv';
import { now } from '@/lib/utils/now';
import { getLatestRates } from '@/modules/exchange-rates/exchange-rate.service';
import {
	getMobileMoneyProviderIdsByPayoutProcess,
	getMobileMoneyProviderPayoutProcess,
	getPayoutProcessOverviewOptions,
} from '@/modules/mobile-money-providers/mobile-money-provider.service';
import { createPayoutProcessPayouts } from '@/modules/payouts/payout.service';
import { getAccessiblePrograms } from '@/modules/program-access/program-access.service';
import { isReadyForFirstPayoutInterval } from '@/modules/programs/program-stats.service';
import { getPayoutProcessRecipients, recipientStatusService } from '@/modules/recipients/recipient.service';
import type { PayoutProcessRecipient } from '@/modules/recipients/recipient.types';
import { format, isSameMonth, startOfMonth } from 'date-fns';
import type {
	OrangeMoneyPayoutProcessInput,
	OrangeMoneyRegistrationPayoutProcessInput,
	PayoutProcessDateInput,
} from './payout-process.schemas';
import type { PreviewPayout } from './payout-process.types';

const DEFAULT_PHONE_DIGITS = 8;
const LIBERIA_PHONE_DIGITS = 9;
const ORANGE_PROVIDER_ERROR = 'Mobile money provider is not configured for Orange Money CSV upload';
const TELECEL_PROVIDER_ERROR = 'No mobile money providers are configured for Telecel CSV upload';

export const buildOrangeRegistrationCsv = (recipients: PayoutProcessRecipient[]): ServiceResult<string> => {
	try {
		const rows: string[][] = [['Mobile Number*', 'Unique Code*', 'User Type*']];

		for (const recipient of recipients) {
			rows.push([formatOrangePhone(recipient), recipient.paymentInformation?.code ?? 'NO_CODE', 'subscriber']);
		}

		return resultOk(stringifyCsvLines(rows));
	} catch (error) {
		console.error('Could not build Orange Money registration CSV', { error });

		return resultFail('Could not generate registration CSV');
	}
};

export const buildOrangePayoutCsv = (recipients: PayoutProcessRecipient[], selectedDate: Date): ServiceResult<string> => {
	try {
		const monthLabel = format(selectedDate, 'MMMM yyyy');
		const rows: string[][] = [
			['Mobile Number*', 'Amount*', 'First Name', 'Last Name', 'Id Number', 'Remarks*', 'User Type*'],
		];

		for (const recipient of recipients) {
			rows.push([
				formatOrangePhone(recipient),
				recipient.program.payoutPerInterval.toString(),
				recipient.contact.firstName,
				recipient.contact.lastName,
				recipient.paymentInformation?.code ?? 'NO_CODE',
				`Social Income ${monthLabel}`,
				'subscriber',
			]);
		}

		return resultOk(stringifyCsvLines(rows));
	} catch (error) {
		console.error('Could not build Orange Money payout CSV', { error });

		return resultFail('Could not generate payout CSV');
	}
};

export const buildTelecelPayoutCsv = (recipients: PayoutProcessRecipient[]): ServiceResult<string> => {
	try {
		const rows: string[][] = [['MSISDN', 'Amount', 'Telco']];

		for (const recipient of recipients) {
			const phone = recipient.paymentInformation?.phone?.number ?? 'NO_PHONE';
			const providerName = recipient.paymentInformation?.mobileMoneyProvider?.name ?? '';
			rows.push([phone.replace(/^\+/, ''), recipient.program.payoutPerInterval.toString(), providerName]);
		}

		return resultOk(stringifyCsvLines(rows));
	} catch (error) {
		console.error('Could not build Telecel payout CSV', { error });

		return resultFail('Could not generate payout CSV');
	}
};

export const generateOrangeRegistrationCsv = async (
	userId: string,
	input: OrangeMoneyRegistrationPayoutProcessInput,
): Promise<ServiceResult<string>> => {
	const recipientsResult = await getOrangeRecipients(userId, input.mobileMoneyProviderId, now());
	if (!recipientsResult.success) {
		return resultFail(recipientsResult.error);
	}

	return buildOrangeRegistrationCsv(recipientsResult.data);
};

export const generateOrangePayoutCsv = async (
	userId: string,
	input: OrangeMoneyPayoutProcessInput,
): Promise<ServiceResult<string>> => {
	const recipientsResult = await getOrangeRecipients(userId, input.mobileMoneyProviderId, input.selectedDate);
	if (!recipientsResult.success) {
		return resultFail(recipientsResult.error);
	}

	return buildOrangePayoutCsv(recipientsResult.data, input.selectedDate);
};

export const previewOrangeCurrentMonthPayouts = async (
	userId: string,
	input: OrangeMoneyPayoutProcessInput,
): Promise<ServiceResult<PreviewPayout[]>> => {
	const recipientsResult = await getOrangeRecipients(userId, input.mobileMoneyProviderId, input.selectedDate);
	if (!recipientsResult.success) {
		return resultFail(recipientsResult.error);
	}

	return previewCurrentMonthPayouts(recipientsResult.data, input.selectedDate);
};

export const generateOrangeCurrentMonthPayouts = async (
	userId: string,
	input: OrangeMoneyPayoutProcessInput,
): Promise<ServiceResult<string>> => {
	const previewResult = await previewOrangeCurrentMonthPayouts(userId, input);
	if (!previewResult.success) {
		return resultFail(previewResult.error);
	}

	return generateCurrentMonthPayouts(userId, previewResult.data, input.selectedDate);
};

export const generateTelecelPayoutCsv = async (
	userId: string,
	input: PayoutProcessDateInput,
): Promise<ServiceResult<string>> => {
	const recipientsResult = await getTelecelRecipients(userId, input.selectedDate);
	if (!recipientsResult.success) {
		return resultFail(recipientsResult.error);
	}

	return buildTelecelPayoutCsv(recipientsResult.data);
};

export const previewTelecelCurrentMonthPayouts = async (
	userId: string,
	input: PayoutProcessDateInput,
): Promise<ServiceResult<PreviewPayout[]>> => {
	const recipientsResult = await getTelecelRecipients(userId, input.selectedDate);
	if (!recipientsResult.success) {
		return resultFail(recipientsResult.error);
	}

	return previewCurrentMonthPayouts(recipientsResult.data, input.selectedDate);
};

export const generateTelecelCurrentMonthPayouts = async (
	userId: string,
	input: PayoutProcessDateInput,
): Promise<ServiceResult<string>> => {
	const previewResult = await previewTelecelCurrentMonthPayouts(userId, input);
	if (!previewResult.success) {
		return resultFail(previewResult.error);
	}

	return generateCurrentMonthPayouts(userId, previewResult.data, input.selectedDate);
};

export const getPayoutRecipientCounts = async (
	userId: string,
	input: PayoutProcessDateInput,
): Promise<ServiceResult<Record<string, number>>> => {
	const optionsResult = await getPayoutProcessOverviewOptions();
	if (!optionsResult.success) {
		return resultFail(optionsResult.error);
	}

	const counts: Record<string, number> = {};
	for (const option of optionsResult.data) {
		const recipientsResult =
			option.kind === 'telecel_csv'
				? await getTelecelRecipients(userId, input.selectedDate)
				: await getOrangeRecipients(userId, option.id, input.selectedDate);
		if (!recipientsResult.success) {
			return resultFail(recipientsResult.error);
		}

		counts[option.id] = countCurrentMonthPayouts(recipientsResult.data, input.selectedDate);
	}

	return resultOk(counts);
};

const getOrangeRecipients = async (
	userId: string,
	mobileMoneyProviderId: string,
	referenceDate: Date,
): Promise<ServiceResult<PayoutProcessRecipient[]>> => {
	const providerResult = await getMobileMoneyProviderPayoutProcess(mobileMoneyProviderId);
	if (!providerResult.success) {
		return resultFail(providerResult.error);
	}
	if (providerResult.data !== PayoutProcess.orange_money_csv) {
		return resultFail(ORANGE_PROVIDER_ERROR);
	}

	return getRecipientsReadyForPayout(userId, [mobileMoneyProviderId], referenceDate);
};

const getTelecelRecipients = async (
	userId: string,
	referenceDate: Date,
): Promise<ServiceResult<PayoutProcessRecipient[]>> => {
	const providersResult = await getMobileMoneyProviderIdsByPayoutProcess(PayoutProcess.telecel_csv);
	if (!providersResult.success) {
		return resultFail(providersResult.error);
	}
	if (providersResult.data.length === 0) {
		return resultFail(TELECEL_PROVIDER_ERROR);
	}

	return getRecipientsReadyForPayout(userId, providersResult.data, referenceDate);
};

const getRecipientsReadyForPayout = async (
	userId: string,
	providerIds: string[],
	referenceDate: Date,
): Promise<ServiceResult<PayoutProcessRecipient[]>> => {
	try {
		const accessResult = await getAccessiblePrograms(userId);
		if (!accessResult.success) {
			return resultFail(accessResult.error);
		}

		const operatorPrograms = accessResult.data.filter(({ permission }) => permission === ProgramPermission.operator);
		if (operatorPrograms.length === 0) {
			return resultFail('No accessible programs found');
		}

		const readyProgramIds: string[] = [];
		for (const program of operatorPrograms) {
			const readinessResult = await isReadyForFirstPayoutInterval(program.programId);
			if (readinessResult.success && readinessResult.data) {
				readyProgramIds.push(program.programId);
			}
		}

		const recipientsResult = await getPayoutProcessRecipients(readyProgramIds, providerIds);
		if (!recipientsResult.success) {
			return resultFail(recipientsResult.error);
		}

		return resultOk(
			recipientsResult.data.filter((recipient) => {
				const paidCountResult = recipientStatusService.countPaidOrConfirmedPayouts(recipient.payouts);
				if (!paidCountResult.success) {
					return false;
				}

				const eligibilityResult = recipientStatusService.isRecipientEligibleForPayout({
					startDate: recipient.startDate,
					suspendedAt: recipient.suspendedAt,
					paidOrConfirmedCount: paidCountResult.data,
					programDurationInMonths: recipient.program.programDurationInMonths,
					payoutInterval: recipient.program.payoutInterval,
					nowDate: referenceDate,
				});

				return eligibilityResult.success && eligibilityResult.data;
			}),
		);
	} catch (error) {
		console.error('Could not fetch payout recipients', { userId, error });

		return resultFail('Could not fetch payout recipients');
	}
};

const countCurrentMonthPayouts = (recipients: PayoutProcessRecipient[], selectedDate: Date): number => {
	const monthStart = startOfMonth(selectedDate);

	return recipients.filter((recipient) => !recipient.payouts.some((payout) => isSameMonth(payout.paymentAt, monthStart)))
		.length;
};

const previewCurrentMonthPayouts = async (
	recipients: PayoutProcessRecipient[],
	selectedDate: Date,
): Promise<ServiceResult<PreviewPayout[]>> => {
	if (recipients.length === 0) {
		return resultOk([]);
	}

	try {
		const exchangeRateResult = await getLatestRates();
		if (!exchangeRateResult.success) {
			return resultFail(exchangeRateResult.error);
		}

		const rates = exchangeRateResult.data;
		const monthStart = startOfMonth(selectedDate);

		return resultOk(
			recipients
				.filter((recipient) => !recipient.payouts.some((payout) => isSameMonth(payout.paymentAt, monthStart)))
				.map((recipient) => {
					const rateCurrency = rates[recipient.program.payoutCurrency];
					const rateChf = rates.CHF;
					const amountChf = rateCurrency && rateChf ? (recipient.program.payoutPerInterval / rateCurrency) * rateChf : null;

					return {
						recipientId: recipient.id,
						firstName: recipient.contact.firstName,
						lastName: recipient.contact.lastName,
						phoneNumber: recipient.paymentInformation?.phone?.number ?? 'NO_PHONE',
						currency: recipient.program.payoutCurrency,
						amount: recipient.program.payoutPerInterval,
						amountChf,
						paymentAt: selectedDate,
						status: PayoutStatus.paid,
					};
				}),
		);
	} catch (error) {
		console.error('Could not preview payouts', { error });

		return resultFail('Could not preview payouts');
	}
};

const generateCurrentMonthPayouts = async (
	userId: string,
	previewPayouts: PreviewPayout[],
	selectedDate: Date,
): Promise<ServiceResult<string>> => {
	if (previewPayouts.length === 0) {
		return resultOk('No payouts to create for this month');
	}

	const createResult = await createPayoutProcessPayouts(userId, previewPayouts, selectedDate);
	if (!createResult.success) {
		return resultFail(createResult.error);
	}

	const monthLabel = format(selectedDate, 'yyyy-MM');
	if (createResult.data.createdCount === 0) {
		return resultOk(`No new payouts to create for ${monthLabel}.`);
	}

	return resultOk(
		createResult.data.skippedCount > 0
			? `Created ${createResult.data.createdCount} payouts for ${monthLabel} (${createResult.data.skippedCount} already existed).`
			: `Created ${createResult.data.createdCount} payouts for ${monthLabel}.`,
	);
};

const formatOrangePhone = (recipient: PayoutProcessRecipient): string => {
	const phone = recipient.paymentInformation?.phone?.number;
	if (!phone) {
		return 'NO_PHONE';
	}

	return recipient.program.payoutCountryCode === CountryCode.LR
		? `0${phone.slice(-LIBERIA_PHONE_DIGITS)}`
		: phone.slice(-DEFAULT_PHONE_DIGITS);
};

import {
	type DonationAmountContext,
	type PaymentMethod,
	DONATION_CUSTOM_AMOUNT_MAX,
	DONATION_CUSTOM_AMOUNT_MIN,
	getDonationDisplayAmount,
	isAmountValid,
} from '@/components/donation-wizard/utils/donation-amount';
import { type Currency } from '@/generated/prisma/enums';
import { type ServiceResult } from '../core/base.types';
import { resultFail, resultOk } from '../core/service-result';
import { type WizardQrPayment } from './qr-bill.types';

const WIZARD_QR_CURRENCIES = new Set<Currency>(['CHF', 'EUR']);

export const isWizardQrCurrencySupported = (currency: string): boolean =>
	WIZARD_QR_CURRENCIES.has(currency.toUpperCase() as Currency);

export const resolveWizardPaymentMethod = (paymentMethod: PaymentMethod, currency: string): PaymentMethod =>
	paymentMethod === 'qr' && !isWizardQrCurrencySupported(currency) ? 'online' : paymentMethod;

const mapCadenceToQrInterval = (cadence: DonationAmountContext['cadence']): number => (cadence === 'monthly' ? 1 : 0);

export const resolveWizardQrPayment = (
	context: DonationAmountContext,
	currency?: string,
): ServiceResult<WizardQrPayment> => {
	if (context.paymentMethod !== 'qr') {
		return resultFail('QR payment requires QR payment method');
	}

	if (!isAmountValid(context)) {
		return resultFail('Invalid donation amount');
	}

	const currencyCode = (currency ?? 'CHF').toUpperCase() as Currency;
	if (!isWizardQrCurrencySupported(currencyCode)) {
		return resultFail(`Unsupported currency for QR bill: ${currency ?? ''}`);
	}

	const amount = getDonationDisplayAmount(context);
	if (amount < DONATION_CUSTOM_AMOUNT_MIN || amount > DONATION_CUSTOM_AMOUNT_MAX) {
		return resultFail('Donation amount is out of allowed range');
	}

	return resultOk({
		amount,
		currency: currencyCode,
		referenceId: '',
		interval: mapCadenceToQrInterval(context.cadence),
		campaignId: context.campaignId,
	});
};

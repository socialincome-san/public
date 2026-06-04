import {
	type DonationAmountContext,
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
	if (!WIZARD_QR_CURRENCIES.has(currencyCode)) {
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

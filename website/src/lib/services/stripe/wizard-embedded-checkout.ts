import {
	type DonationAmountContext,
	DONATION_CUSTOM_AMOUNT_MAX,
	DONATION_CUSTOM_AMOUNT_MIN,
	getDonationDisplayAmount,
	isAmountValid,
} from '@/components/donation-wizard/utils/donation-amount';
import { isValidCurrency } from '@/lib/types/currency';
import { type ServiceResult } from '../core/base.types';
import { resultFail, resultOk } from '../core/service-result';

type ResolvedWizardEmbeddedCheckout = {
	unitAmount: number;
	recurring: boolean;
	campaignId?: string;
	currency: string;
};

export const normalizeCheckoutEmail = (email: string): string => email.trim().toLowerCase();

export const resolveWizardEmbeddedCheckout = (
	context: DonationAmountContext,
	currency?: string,
): ServiceResult<ResolvedWizardEmbeddedCheckout> => {
	if (context.paymentMethod !== 'online') {
		return resultFail('Embedded checkout requires online payment');
	}

	if (!isAmountValid(context)) {
		return resultFail('Invalid donation amount');
	}

	const currencyCode = (currency ?? 'CHF').toUpperCase();
	if (!isValidCurrency(currencyCode)) {
		return resultFail(`Unsupported currency: ${currency ?? ''}`);
	}

	const displayAmount = getDonationDisplayAmount(context);
	const unitAmount = Math.round(displayAmount * 100);
	const minUnitAmount = DONATION_CUSTOM_AMOUNT_MIN * 100;
	const maxUnitAmount = DONATION_CUSTOM_AMOUNT_MAX * 100;

	if (unitAmount < minUnitAmount || unitAmount > maxUnitAmount) {
		return resultFail('Donation amount is out of allowed range');
	}

	return resultOk({
		unitAmount,
		recurring: context.cadence === 'monthly',
		campaignId: context.campaignId,
		currency: currencyCode,
	});
};

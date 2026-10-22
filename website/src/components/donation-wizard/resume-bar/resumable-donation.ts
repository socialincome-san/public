import { useSyncExternalStore } from 'react';
import { parseStoredContext, parseStoredDonation } from '../steps/step-stripe-checkout/stripe-checkout-return';
import type { DonationAmountContext } from '../utils/donation-amount';
import { paymentContextForOneTimePlanChoice } from '../wizard/donation-machine-logic';

const STORAGE_KEY = 'donation-wizard:resumable-donation';

const listeners = new Set<() => void>();
// The value for this page load, for when storage is blocked.
let pageValue: string | null = null;
let cachedValue: string | null = null;
let cachedDonation: DonationAmountContext | null = null;

const subscribe = (listener: () => void) => {
	listeners.add(listener);

	return () => {
		listeners.delete(listener);
	};
};

const readValue = () => {
	try {
		return window.sessionStorage.getItem(STORAGE_KEY);
	} catch {
		return pageValue;
	}
};

const writeValue = (value: string | null) => {
	pageValue = value;
	try {
		if (value === null) {
			window.sessionStorage.removeItem(STORAGE_KEY);
		} else {
			window.sessionStorage.setItem(STORAGE_KEY, value);
		}
	} catch {
		// Storage is blocked, e.g. in some private modes: the bar only lasts until the next page load.
	}
	listeners.forEach((listener) => listener());
};

// useSyncExternalStore needs the same object for the same stored value.
const getSnapshot = () => {
	const value = readValue();
	if (value !== cachedValue) {
		cachedValue = value;
		cachedDonation = parseStoredDonation(value);
	}

	return cachedDonation;
};

/** The donation of a wizard that was closed before paying, or `null`. Always `null` on the server. */
export const useResumableDonation = () => useSyncExternalStore(subscribe, getSnapshot, () => null);

/**
 * The donation to offer after the wizard was closed, paid online. The transaction fee is only kept once chosen on the
 * payment step, because earlier steps still hold the default.
 */
export const toResumableDonation = (
	context: DonationAmountContext,
	reachedPaymentStep: boolean,
): DonationAmountContext | null =>
	// Parsing keeps only the amount fields, so contact details from the QR flow never reach storage.
	parseStoredContext({
		...context,
		// The plan choice is only applied when leaving the one-time plan step, but the bar must show what was chosen.
		...(context.returnsToOneTimePlanStep ? paymentContextForOneTimePlanChoice(context.oneTimePlanChoice) : {}),
		paymentMethod: 'online',
		coverTransactionCosts: reachedPaymentStep && context.paymentMethod === 'online' && context.coverTransactionCosts,
	});

export const storeResumableDonation = (donation: DonationAmountContext): void => writeValue(JSON.stringify(donation));

export const clearResumableDonation = (): void => writeValue(null);

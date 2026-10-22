import { useSyncExternalStore } from 'react';
import { parseStoredContext } from '../steps/step-stripe-checkout/stripe-checkout-return';
import type { DonationAmountContext } from '../utils/donation-amount';
import { paymentContextForOneTimePlanChoice } from '../wizard/donation-machine-logic';
import type { ResumableWizardStep } from '../wizard/donation-wizard-context';

const STORAGE_KEY = 'donation-wizard:resumable-donation';

export const resumableSteps = [
	'stepPlanMonthly',
	'stepPlanOneTime',
	'stepPayment',
	'stepStripeCheckout',
	'stepQrContact',
] as const satisfies readonly ResumableWizardStep[];

/** A wizard closed before paying: the step it was left on and the choices made so far. */
export type ResumableDonation = {
	step: ResumableWizardStep;
	context: DonationAmountContext;
};

const isResumableStep = (value: unknown): value is ResumableWizardStep => resumableSteps.some((step) => step === value);

const parseResumableDonation = (value: string | null): ResumableDonation | null => {
	if (!value) {
		return null;
	}

	try {
		const parsed: unknown = JSON.parse(value);
		if (typeof parsed !== 'object' || parsed === null || !('step' in parsed) || !('context' in parsed)) {
			return null;
		}
		const context = parseStoredContext(parsed.context);

		return isResumableStep(parsed.step) && context ? { step: parsed.step, context } : null;
	} catch {
		return null;
	}
};

const listeners = new Set<() => void>();
// The value for this page load, for when storage is blocked.
let pageValue: string | null = null;
let cachedValue: string | null = null;
let cachedDonation: ResumableDonation | null = null;

const subscribe = (listener: () => void) => {
	listeners.add(listener);

	return () => {
		listeners.delete(listener);
	};
};

// After a failed write, storage may still hold an older donation, so this page load trusts `pageValue` instead.
let writeFailed = false;

const readValue = () => {
	if (writeFailed) {
		return pageValue;
	}

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
		writeFailed = false;
	} catch {
		// Storage is blocked or full, e.g. in some private modes: the bar only lasts until the next page load.
		writeFailed = true;
	}
	listeners.forEach((listener) => listener());
};

// useSyncExternalStore needs the same object for the same stored value.
const getSnapshot = () => {
	const value = readValue();
	if (value !== cachedValue) {
		cachedValue = value;
		cachedDonation = parseResumableDonation(value);
	}

	return cachedDonation;
};

/** The donation of a wizard that was closed before paying, or `null`. Always `null` on the server. */
export const useResumableDonation = () => useSyncExternalStore(subscribe, getSnapshot, () => null);

/**
 * The donation the bar shows and charges with Apple Pay or Google Pay. The transaction fee is only kept once chosen on
 * the payment step, because earlier steps still hold the default.
 */
export const toWalletDonation = ({ step, context }: ResumableDonation): DonationAmountContext => ({
	...context,
	// The plan choice is only applied when leaving the one-time plan step, but the bar must show what was chosen.
	...(context.returnsToOneTimePlanStep ? paymentContextForOneTimePlanChoice(context.oneTimePlanChoice) : {}),
	paymentMethod: 'online',
	coverTransactionCosts:
		(step === 'stepPayment' || step === 'stepStripeCheckout') &&
		context.paymentMethod === 'online' &&
		context.coverTransactionCosts,
});

export const storeResumableDonation = (step: ResumableWizardStep, context: DonationAmountContext): void => {
	// Parsing keeps only the amount fields, so contact details from the QR flow never reach storage.
	const amountContext = parseStoredContext(context);
	if (amountContext) {
		writeValue(JSON.stringify({ step, context: amountContext }));
	}
};

export const clearResumableDonation = (): void => writeValue(null);

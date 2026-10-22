'use client';

import { createContext, useContext } from 'react';
import type { DonationAmountContext } from '../utils/donation-amount';

type DonationModalContextValue = {
	isOpen: boolean;
	openWizardAtAmountStep: () => void;
	openWizardWithFormAmount: (context: DonationAmountContext) => void;
	// Reopens a donation from the donation bar exactly as it was left
	resumeDonation: (context: DonationAmountContext) => void;
	// Continues with the post-payment onboarding after a payment outside the wizard
	openWizardAfterPayment: (context: DonationAmountContext, sessionId: string) => void;
};

export const DonationModalContext = createContext<DonationModalContextValue | null>(null);

export const useDonationModal = (): DonationModalContextValue => {
	const context = useContext(DonationModalContext);
	if (!context) {
		throw new Error('useDonationModal must be used within DonationModalProvider');
	}

	return context;
};

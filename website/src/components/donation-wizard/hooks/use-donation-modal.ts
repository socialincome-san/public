'use client';

import { createContext, useContext } from 'react';
import type { DonationAmountContext } from '../utils/donation-amount';

type DonationModalContextValue = {
	/** Navbar / bare button — opens wizard step 1 in the modal. */
	openDonationWizard: () => void;
	/** Hero, nav flyout, etc. — skips to step 2 with amount and cadence from the embedded form. */
	openDonationWizardFromForm: (context: DonationAmountContext) => void;
};

export const DonationModalContext = createContext<DonationModalContextValue | null>(null);

export const useDonationModal = (): DonationModalContextValue => {
	const context = useContext(DonationModalContext);
	if (!context) {
		throw new Error('useDonationModal must be used within DonationModalProvider');
	}

	return context;
};

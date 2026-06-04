'use client';

import { createContext, useContext } from 'react';
import type { DonationAmountContext } from '../utils/donation-amount';

type DonationModalContextValue = {
	openWizardAtAmountStep: () => void;
	openWizardWithFormAmount: (context: DonationAmountContext) => void;
};

export const DonationModalContext = createContext<DonationModalContextValue | null>(null);

export const useDonationModal = (): DonationModalContextValue => {
	const context = useContext(DonationModalContext);
	if (!context) {
		throw new Error('useDonationModal must be used within DonationModalProvider');
	}

	return context;
};

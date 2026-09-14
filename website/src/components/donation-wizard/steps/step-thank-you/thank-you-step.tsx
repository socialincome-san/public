'use client';

import type { DonationWizardStepProps } from '../../wizard/types';
import { DonationLoggedInPrompt } from './donation-logged-in-prompt';
import { DonationLoginPrompt } from './donation-login-prompt';

export const ThankYouStep = ({ state, send }: DonationWizardStepProps) => {
	const prefilledEmail = state.context.loginEmail ?? state.context.qrDonor?.email ?? '';
	const closeWizard = () => send({ type: 'CLOSE' });

	if (state.context.isLoggedInDonor) {
		return <DonationLoggedInPrompt onDashboardClick={closeWizard} />;
	}

	return <DonationLoginPrompt prefilledEmail={prefilledEmail} onLoginClick={closeWizard} />;
};

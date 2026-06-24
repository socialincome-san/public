'use client';

import type { DonationWizardStepProps } from '../../wizard/types';
import { DonationLoginPrompt } from './donation-login-prompt';

export const ThankYouStep = ({ state, send }: DonationWizardStepProps) => {
	const prefilledEmail = state.context.loginEmail ?? state.context.qrDonor?.email ?? '';

	return <DonationLoginPrompt prefilledEmail={prefilledEmail} onLoginClick={() => send({ type: 'CLOSE' })} />;
};

'use client';

import { DonationImpactPanel } from '../shared/donation-impact-panel';
import { donationWizardStepColumnClass } from '../utils/donation-wizard-layout';
import { DonationSteps } from './donation-steps';
import { getActiveWizardStep } from './get-active-wizard-step';
import type { DonationWizardStepProps } from './types';

export const DonationWizard = ({ state, send }: DonationWizardStepProps) => {
	const activeStep = getActiveWizardStep(state);
	const isPaymentStep = activeStep === 'step3Payment';
	const showImpactPanel = activeStep === 'step1' || activeStep === 'step2Monthly' || activeStep === 'step2OneTime';

	return (
		<div className="flex min-h-0 flex-1 flex-col overflow-hidden" role="region" aria-label="Donation wizard">
			<div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-6 sm:px-6 sm:pb-9 md:px-9">
				<div className="mx-auto flex w-full max-w-[890px] flex-col items-center gap-8 md:flex-row md:items-start md:justify-center">
					<div
						className={
							isPaymentStep ? 'flex w-full min-w-0 justify-center md:justify-stretch' : donationWizardStepColumnClass
						}
					>
						<DonationSteps state={state} send={send} />
					</div>
					{showImpactPanel && (
						<div className="w-full max-w-[400px] min-w-0 md:max-w-none md:flex-1">
							<DonationImpactPanel communityStats={state.context.communityStats} />
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

'use client';

import { DonationImpactPanel } from '../shared/donation-impact-panel';
import { donationWizardStepColumnClass } from '../utils/donation-wizard-layout';
import { selectWizardShellView } from './donation-machine-selectors';
import { DonationSteps } from './donation-steps';
import type { DonationWizardStepProps } from './types';

export const DonationWizard = ({ state, send }: DonationWizardStepProps) => {
	const shell = selectWizardShellView(state);

	return (
		<div className="flex min-h-0 flex-1 flex-col overflow-hidden" role="region" aria-label="Donation wizard">
			<div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-6 sm:px-6 sm:pb-9 md:px-9">
				<div className="mx-auto flex w-full max-w-[890px] flex-col items-center gap-8 md:flex-row md:items-start md:justify-center">
					<div
						className={
							shell.isPaymentStep ? 'flex w-full min-w-0 justify-center md:justify-stretch' : donationWizardStepColumnClass
						}
					>
						<DonationSteps state={state} send={send} />
					</div>
					{shell.showImpactPanel && (
						<div className="w-full max-w-[400px] min-w-0 md:max-w-none md:flex-1">
							<DonationImpactPanel communityStats={shell.communityStats} />
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

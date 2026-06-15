'use client';

import { DonationImpactPanel } from '../shared/donation-impact-panel';
import { QrContactHintsPanel } from '../steps/step-qr-contact/qr-contact-hints-panel';
import { selectWizardShellView } from './donation-machine-selectors';
import { DonationSteps } from './donation-steps';
import type { DonationWizardStepProps } from './types';

export const DonationWizard = ({ state, send }: DonationWizardStepProps) => {
	const shell = selectWizardShellView(state);

	return (
		<div className="flex min-h-0 flex-1 flex-col overflow-hidden" role="region" aria-label="Donation wizard">
			<div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-6 sm:px-6 sm:pb-9 md:px-9">
				<div className="mx-auto flex w-full max-w-[890px] flex-col items-stretch gap-8 md:flex-row md:items-start">
					<div className={shell.columnClass}>
						<DonationSteps state={state} send={send} />
					</div>
					{shell.showImpactPanel && (
						<div className="w-full min-w-0 md:flex-1">
							<DonationImpactPanel communityStats={shell.communityStats} />
						</div>
					)}
					{shell.showQrHintsPanel && (
						<div className="w-full min-w-0 md:flex-1">
							<QrContactHintsPanel />
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

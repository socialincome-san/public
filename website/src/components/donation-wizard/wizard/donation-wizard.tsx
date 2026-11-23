'use client';

import { cn } from '@socialincome/design-system/cn';
import type { ReactNode } from 'react';
import { DonationInfoCard } from '../shared/donation-info-card';
import { QrContactHintsPanel } from '../steps/step-qr-contact/qr-contact-hints-panel';
import { selectWizardShellView } from './donation-machine-selectors';
import { DonationSteps } from './donation-steps';
import type { DonationWizardStepProps } from './types';

export const DonationWizard = ({ state, send, header }: DonationWizardStepProps & { header?: ReactNode }) => {
	const shell = selectWizardShellView(state);

	return (
		<div className="flex min-h-0 flex-1 flex-col overflow-hidden" role="region" aria-label="Donation wizard">
			<div className="flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-4 pb-6 sm:px-6 sm:pb-9 md:px-9">
				{header}
				<div
					className={cn(
						'mx-auto flex w-full max-w-[890px] flex-col items-stretch gap-8 md:flex-row',
						// The measured content height of the monthly plan step on desktop; re-measure when its tiles or info card change
						shell.hasSharedHeight ? 'md:min-h-[315px]' : 'md:items-start',
					)}
				>
					<div className={shell.columnClass}>
						<DonationSteps state={state} send={send} />
					</div>
					{shell.showImpactPanel && (
						<div className="w-full min-w-0 md:flex-1">
							<DonationInfoCard context={state.context} />
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

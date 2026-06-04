'use client';

import type { ContributorCommunityStats } from '@/lib/services/contributor/contributor.types';
import { DonationImpactPanel } from '../shared/donation-impact-panel';
import { donationWizardStepColumnClass } from '../utils/donation-wizard-layout';
import { DonationSteps } from './donation-steps';
import type { DonationWizardSend, DonationWizardState } from './types';

type Props = {
	state: DonationWizardState;
	send: DonationWizardSend;
	communityStats: ContributorCommunityStats | null;
};

export const DonationWizard = ({ state, send, communityStats }: Props) => {
	const isPaymentStep = state.matches('step3Payment');

	return (
		<div className="flex min-h-0 flex-1 flex-col overflow-hidden" role="region" aria-label="Donation wizard">
			<div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-6 sm:px-6 sm:pb-9 md:px-9">
				<div className="mx-auto flex w-full max-w-[890px] flex-col items-center gap-8 md:flex-row md:items-start md:justify-center">
					<div
						className={
							isPaymentStep ? 'flex w-full min-w-0 justify-center md:justify-stretch' : donationWizardStepColumnClass
						}
					>
						<DonationSteps state={state} send={send} communityStats={communityStats} />
					</div>
					{!isPaymentStep && (
						<div className="w-full max-w-[400px] min-w-0 md:max-w-none md:flex-1">
							<DonationImpactPanel communityStats={communityStats} />
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

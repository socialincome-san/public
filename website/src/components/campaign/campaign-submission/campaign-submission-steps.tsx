'use client';

import { AboutStep } from './steps/about-step';
import { DetailsStep } from './steps/details-step';
import { ProgramStep } from './steps/program-step';
import type { AboutStepProps, CampaignSubmissionStepId, DetailsStepProps, ProgramStepProps } from './types';

type Props = {
	currentStep: CampaignSubmissionStepId;
	programStep: ProgramStepProps;
	detailsStep: DetailsStepProps;
	aboutStep: AboutStepProps;
};

export const CampaignSubmissionSteps = ({ currentStep, programStep, detailsStep, aboutStep }: Props) => {
	switch (currentStep) {
		case 'program':
			return (
				<div className="flex min-h-0 flex-1 flex-col">
					<ProgramStep {...programStep} />
				</div>
			);
		case 'details':
			return (
				<div className="min-h-0 flex-1 overflow-y-auto">
					<DetailsStep {...detailsStep} />
				</div>
			);
		case 'about':
			return (
				<div className="min-h-0 flex-1 overflow-y-auto">
					<AboutStep {...aboutStep} />
				</div>
			);
	}
};

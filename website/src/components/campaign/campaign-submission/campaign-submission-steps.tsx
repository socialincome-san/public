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
	if (currentStep === 'program') {
		return (
			<div className="flex min-h-0 flex-1 flex-col">
				<ProgramStep {...programStep} />
			</div>
		);
	}

	if (currentStep === 'details') {
		return (
			<div className="min-h-0 flex-1 overflow-y-auto">
				<DetailsStep {...detailsStep} />
			</div>
		);
	}

	if (currentStep === 'about') {
		return (
			<div className="min-h-0 flex-1 overflow-y-auto">
				<AboutStep {...aboutStep} />
			</div>
		);
	}

	return null;
};

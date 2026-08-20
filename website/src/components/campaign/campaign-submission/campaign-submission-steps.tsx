'use client';

import { CampaignSubmissionFormCard, CampaignSubmissionFormCardColumn } from './form-layout';
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
				<CampaignSubmissionFormCardColumn key={currentStep}>
					<CampaignSubmissionFormCard>
						<DetailsStep {...detailsStep} />
					</CampaignSubmissionFormCard>
				</CampaignSubmissionFormCardColumn>
			);
		case 'about':
			return (
				<CampaignSubmissionFormCardColumn key={currentStep}>
					<AboutStep {...aboutStep} />
				</CampaignSubmissionFormCardColumn>
			);
	}
};

'use client';

import { CampaignSubmissionFormCard, CampaignSubmissionFormCardColumn } from './form-layout';
import { AboutStep } from './steps/about-step';
import { DetailsStep } from './steps/details-step';
import { PersonalStep } from './steps/personal-step';
import { ProgramStep } from './steps/program-step';
import type {
	AboutStepProps,
	CampaignSubmissionStepId,
	DetailsStepProps,
	PersonalStepProps,
	ProgramStepProps,
} from './types';

type Props = {
	currentStep: CampaignSubmissionStepId;
	programStep: ProgramStepProps;
	detailsStep: DetailsStepProps;
	aboutStep: AboutStepProps;
	personalStep: PersonalStepProps;
};

export const CampaignSubmissionSteps = ({ currentStep, programStep, detailsStep, aboutStep, personalStep }: Props) => {
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
		case 'personal':
			return (
				<CampaignSubmissionFormCardColumn key={currentStep}>
					<PersonalStep {...personalStep} />
				</CampaignSubmissionFormCardColumn>
			);
	}
};

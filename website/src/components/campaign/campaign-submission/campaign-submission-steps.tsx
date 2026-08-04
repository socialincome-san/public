'use client';

import { DetailsStep } from './steps/details-step';
import { ProgramStep } from './steps/program-step';
import type { CampaignSubmissionStepId, CampaignSubmissionStepProps } from './types';

type Props = Omit<CampaignSubmissionStepProps, 'onContinue' | 'onBack' | 'isSubmitting'> & {
	currentStep: CampaignSubmissionStepId;
};

export const CampaignSubmissionSteps = ({ currentStep, ...stepProps }: Props) => {
	if (currentStep === 'program') {
		return (
			<ProgramStep
				form={stepProps.form}
				labels={stepProps.labels}
				programs={stepProps.programs}
				programsError={stepProps.programsError}
			/>
		);
	}

	if (currentStep === 'details') {
		return (
			<DetailsStep
				form={stepProps.form}
				labels={stepProps.labels}
				primaryImageInputRef={stepProps.primaryImageInputRef}
				onImageChange={stepProps.onImageChange}
				imageError={stepProps.imageError}
				showImageRequired={stepProps.showImageRequired}
				showDetailsErrors={stepProps.showDetailsErrors}
				submitError={stepProps.submitError}
			/>
		);
	}

	return null;
};

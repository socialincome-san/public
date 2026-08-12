'use client';

import { AboutStep } from './steps/about-step';
import { DetailsStep } from './steps/details-step';
import { ProgramStep } from './steps/program-step';
import type { CampaignSubmissionStepId, CampaignSubmissionStepProps } from './types';

type Props = CampaignSubmissionStepProps & {
	currentStep: CampaignSubmissionStepId;
};

export const CampaignSubmissionSteps = ({ currentStep, ...stepProps }: Props) => {
	if (currentStep === 'program') {
		return (
			<div className="flex min-h-0 flex-1 flex-col">
				<ProgramStep
					form={stepProps.form}
					labels={stepProps.labels}
					programs={stepProps.programs}
					programsLoading={stepProps.programsLoading}
					programsError={stepProps.programsError}
				/>
			</div>
		);
	}

	if (currentStep === 'details') {
		return (
			<div className="min-h-0 flex-1 overflow-y-auto">
				<DetailsStep
					form={stepProps.form}
					labels={stepProps.labels}
					primaryImageInputRef={stepProps.primaryImageInputRef}
					imageSelection={stepProps.imageSelection}
					defaultImages={stepProps.defaultImages}
					defaultImagesLoading={stepProps.defaultImagesLoading}
					defaultImagesError={stepProps.defaultImagesError}
					uploadPreviewUrl={stepProps.uploadPreviewUrl}
					onSelectDefaultImage={stepProps.onSelectDefaultImage}
					onImageChange={stepProps.onImageChange}
					imageError={stepProps.imageError}
				/>
			</div>
		);
	}

	if (currentStep === 'about') {
		return (
			<div className="min-h-0 flex-1 overflow-y-auto">
				<AboutStep
					form={stepProps.form}
					labels={stepProps.labels}
					profilePictureInputRef={stepProps.profilePictureInputRef}
					profilePicture={stepProps.profilePicture}
					sectionImageInputRef={stepProps.sectionImageInputRef}
					sectionImage={stepProps.sectionImage}
					submitError={stepProps.submitError}
					isSubmitting={stepProps.isSubmitting}
				/>
			</div>
		);
	}

	return null;
};

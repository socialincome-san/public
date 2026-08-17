'use client';

import { Button } from '@/components/button/button';
import { CampaignSubmissionStepIndicator } from './campaign-submission-step-indicator';
import type { CampaignSubmissionStepId, SubmissionLabels } from './types';

type Props = {
	currentStep: CampaignSubmissionStepId;
	labels: SubmissionLabels;
	isContinueDisabled: boolean;
	isSubmitting: boolean;
	onContinue: () => void;
	onBack: () => void;
	onSubmit: () => void;
};

export const CampaignSubmissionFooter = ({
	currentStep,
	labels,
	isContinueDisabled,
	isSubmitting,
	onContinue,
	onBack,
	onSubmit,
}: Props) => {
	const isFirstStep = currentStep === 'program';
	const isLastStep = currentStep === 'about';

	return (
		<div className="flex items-center justify-between gap-4 border-t px-6 pt-4">
			<div className="flex min-w-0 flex-1 justify-start">
				{!isFirstStep ? (
					<Button type="button" variant="outline" disabled={isSubmitting} onClick={onBack}>
						{labels.back}
					</Button>
				) : null}
			</div>

			<CampaignSubmissionStepIndicator
				currentStep={currentStep}
				formStepsLabel={labels.formSteps}
				stepLabel={labels.stepLabel}
				programLabel={labels.program}
				detailsLabel={labels.details}
				aboutLabel={labels.about}
				className="hidden sm:flex"
			/>

			<div className="flex min-w-0 flex-1 justify-end">
				{isLastStep ? (
					// Always type="button": swapping Continue → type="submit" mid-click submits the previous step immediately
					<Button type="button" disabled={isSubmitting} onClick={onSubmit}>
						{isSubmitting ? labels.submitting : labels.submit}
					</Button>
				) : (
					<Button type="button" disabled={isContinueDisabled} onClick={onContinue}>
						{labels.continue}
					</Button>
				)}
			</div>
		</div>
	);
};

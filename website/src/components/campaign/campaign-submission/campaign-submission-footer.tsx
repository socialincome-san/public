'use client';

import { Button } from '@/components/button';
import { CampaignSubmissionStepIndicator } from './campaign-submission-step-indicator';
import type { CampaignSubmissionStepId, SubmissionLabels } from './types';

type Props = {
	currentStep: CampaignSubmissionStepId;
	labels: SubmissionLabels;
	programsError: string | null;
	isSubmitting: boolean;
	onContinue: () => void;
	onBack: () => void;
	onSubmit: () => void;
};

export const CampaignSubmissionFooter = ({
	currentStep,
	labels,
	programsError,
	isSubmitting,
	onContinue,
	onBack,
	onSubmit,
}: Props) => {
	const isFirstStep = currentStep === 'program';
	const isLastStep = currentStep === 'details';

	return (
		<div className="flex items-center justify-between gap-4 border-t pt-4">
			<div className="flex min-w-0 flex-1 justify-start">
				{!isFirstStep ? (
					<Button type="button" variant="outline" onClick={onBack}>
						{labels.back}
					</Button>
				) : null}
			</div>

			<CampaignSubmissionStepIndicator currentStep={currentStep} />

			<div className="flex min-w-0 flex-1 justify-end">
				{isLastStep ? (
					// Always type="button": swapping Continue → type="submit" mid-click submits step 2 immediately
					<Button type="button" disabled={isSubmitting} onClick={onSubmit}>
						{isSubmitting ? labels.submitting : labels.submit}
					</Button>
				) : (
					<Button type="button" disabled={Boolean(programsError)} onClick={onContinue}>
						{labels.continue}
					</Button>
				)}
			</div>
		</div>
	);
};

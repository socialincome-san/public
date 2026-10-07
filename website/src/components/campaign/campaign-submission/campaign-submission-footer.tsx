'use client';

import { Button } from '@socialincome/design-system/actions/button/button';
import { WizardFooter } from '@socialincome/design-system/navigation/wizard-footer/wizard-footer';
import { CampaignSubmissionStepIndicator } from './campaign-submission-step-indicator';
import type { CampaignSubmissionStepId, SubmissionLabels } from './types';

type Props = {
	currentStep: CampaignSubmissionStepId;
	visibleSteps: readonly CampaignSubmissionStepId[];
	labels: SubmissionLabels;
	isContinueDisabled: boolean;
	isSubmitting: boolean;
	onContinue: () => void;
	onBack: () => void;
	onSubmit: () => void;
};

export const CampaignSubmissionFooter = ({
	currentStep,
	visibleSteps,
	labels,
	isContinueDisabled,
	isSubmitting,
	onContinue,
	onBack,
	onSubmit,
}: Props) => {
	const isFirstStep = currentStep === 'program';
	const isLastStep = currentStep === visibleSteps[visibleSteps.length - 1];

	return (
		<WizardFooter
			edge="inset"
			progressOnMobile="hidden"
			back={
				isFirstStep ? null : (
					<Button type="button" variant="outline" disabled={isSubmitting} onClick={onBack}>
						{labels.back}
					</Button>
				)
			}
			progress={
				<CampaignSubmissionStepIndicator
					currentStep={currentStep}
					steps={visibleSteps}
					formStepsLabel={labels.formSteps}
					stepLabel={labels.stepLabel}
					programLabel={labels.program}
					detailsLabel={labels.details}
					aboutLabel={labels.about}
					personalLabel={labels.personal}
				/>
			}
			primary={
				isLastStep ? (
					// Always type="button": swapping Continue → type="submit" mid-click submits the previous step immediately
					<Button type="button" disabled={isSubmitting || isContinueDisabled} onClick={onSubmit}>
						{isSubmitting ? labels.submitting : labels.submit}
					</Button>
				) : (
					<Button type="button" disabled={isContinueDisabled} onClick={onContinue}>
						{labels.continue}
					</Button>
				)
			}
		/>
	);
};

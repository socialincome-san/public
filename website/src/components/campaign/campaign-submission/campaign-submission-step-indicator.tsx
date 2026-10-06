'use client';

import { StepIndicator } from '@socialincome/design-system/navigation/step-indicator/step-indicator';
import type { CampaignSubmissionStepId } from './types';

type Props = {
	currentStep: CampaignSubmissionStepId;
	steps: readonly CampaignSubmissionStepId[];
	formStepsLabel: string;
	stepLabel: string;
	programLabel: string;
	detailsLabel: string;
	aboutLabel: string;
	personalLabel: string;
	variant?: 'circles' | 'bars';
};

export const CampaignSubmissionStepIndicator = ({
	currentStep,
	steps,
	formStepsLabel,
	stepLabel,
	programLabel,
	detailsLabel,
	aboutLabel,
	personalLabel,
	variant = 'circles',
}: Props) => {
	const activeIndex = steps.indexOf(currentStep);

	const getStepName = (stepId: CampaignSubmissionStepId) => {
		if (stepId === 'program') {
			return programLabel;
		}

		if (stepId === 'details') {
			return detailsLabel;
		}

		if (stepId === 'personal') {
			return personalLabel;
		}

		return aboutLabel;
	};

	const getStepAriaLabel = (index: number) =>
		stepLabel.replace('{{number}}', String(index + 1)).replace('{{name}}', getStepName(steps[index]));

	return (
		<StepIndicator
			variant={variant === 'bars' ? 'bars' : 'dots'}
			steps={steps.map((_, index) => ({ label: getStepAriaLabel(index) }))}
			activeIndex={activeIndex}
			ariaLabel={formStepsLabel}
		/>
	);
};

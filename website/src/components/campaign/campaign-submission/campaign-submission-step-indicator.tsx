'use client';

import { StepIndicator } from '@socialincome/design-system/navigation/step-indicator/step-indicator';
import { useTranslations } from 'next-intl';
import type { CampaignSubmissionStepId } from './types';

type Props = {
	currentStep: CampaignSubmissionStepId;
	steps: readonly CampaignSubmissionStepId[];
	formStepsLabel: string;
	programLabel: string;
	detailsLabel: string;
	aboutLabel: string;
	personalLabel: string;
	variant?: 'dots' | 'bars';
};

export const CampaignSubmissionStepIndicator = ({
	currentStep,
	steps,
	formStepsLabel,
	programLabel,
	detailsLabel,
	aboutLabel,
	personalLabel,
	variant = 'dots',
}: Props) => {
	const t = useTranslations('website-common');
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
		t('campaigns-page.submission.step-label', { number: index + 1, name: getStepName(steps[index]) });

	return (
		<StepIndicator
			variant={variant}
			steps={steps.map((_, index) => ({ label: getStepAriaLabel(index) }))}
			activeIndex={activeIndex}
			ariaLabel={formStepsLabel}
		/>
	);
};

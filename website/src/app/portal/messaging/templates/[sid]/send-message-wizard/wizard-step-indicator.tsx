'use client';

import { StepIndicator } from '@socialincome/design-system/navigation/step-indicator/step-indicator';
import type { WizardStep } from './validity';

export type StepMeta = { step: WizardStep; label: string };

type WizardStepIndicatorProps = {
	steps: StepMeta[];
	currentStep: WizardStep;
	allComplete?: boolean;
	onStepSelect?: (step: WizardStep) => void;
};

export const WizardStepIndicator = ({ steps, currentStep, allComplete = false, onStepSelect }: WizardStepIndicatorProps) => {
	const currentIndex = steps.findIndex((s) => s.step === currentStep);
	const activeIndex = allComplete ? steps.length : currentIndex === -1 ? 0 : currentIndex;

	return (
		<StepIndicator
			variant="labelled"
			ariaLabel="Progress"
			steps={steps.map(({ label }) => ({ label }))}
			activeIndex={activeIndex}
			onStepSelect={onStepSelect ? (index) => onStepSelect(steps[index].step) : undefined}
		/>
	);
};

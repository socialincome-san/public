'use client';

import { StepIndicator } from '@socialincome/design-system/navigation/step-indicator/step-indicator';
import { CreateProgramWizardState } from './types';

const getCurrentStepIndex = (state: CreateProgramWizardState): number => {
	if (state.matches('countrySelection')) {
		return 0;
	}

	if (state.matches('programSetup')) {
		return 1;
	}

	if (state.matches('budget')) {
		return 2;
	}

	if (state.matches('accountDetails')) {
		return 3;
	}

	return 0;
};

type Props = {
	state: CreateProgramWizardState;
};

export const CreateProgramStepIndicator = ({ state }: Props) => {
	const activeIndex = getCurrentStepIndex(state);

	const showFourthStep = state.context.isAuthenticated === false;
	const stepCount = showFourthStep ? 4 : 3;

	return <StepIndicator steps={Array.from({ length: stepCount }, () => ({}))} activeIndex={activeIndex} />;
};

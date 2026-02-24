'use client';

import { cn } from '@/lib/utils/cn';
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

	if (state.matches('auth')) {
		return 3;
	}
	return 0;
};

const stepClasses = {
	base: 'flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-colors',
	active: [
		'relative isolate z-10',
		'text-primary-foreground bg-primary/90 shadow-sm',
		'after:absolute after:inset-0 after:-z-10 after:rounded-full',
		'after:bg-linear-to-r after:from-[hsl(var(--gradient-button-from))] after:to-[hsl(var(--gradient-button-to))]',
		'after:opacity-100 hover:after:opacity-0',
		'after:transition-opacity',
	],
	completed: 'bg-muted text-foreground',
	inactive: 'text-muted-foreground border',
};

type Props = {
	state: CreateProgramWizardState;
};

export const CreateProgramStepIndicator = ({ state }: Props) => {
	const activeIndex = getCurrentStepIndex(state);

	const showLoginStep = state.context.isAuthenticated === false;
	const stepCount = showLoginStep ? 4 : 3;

	return (
		<div className="flex items-center gap-3">
			{Array.from({ length: stepCount }).map((_, index) => {
				const isActive = index === activeIndex;
				const isCompleted = index < activeIndex;

				return (
					<div key={index} className="flex items-center gap-3">
						<div
							className={cn(
								stepClasses.base,
								isActive && stepClasses.active,
								isCompleted && stepClasses.completed,
								!isActive && !isCompleted && stepClasses.inactive,
							)}
						>
							{index + 1}
						</div>

						{index < stepCount - 1 && <div className="bg-muted h-px w-6" />}
					</div>
				);
			})}
		</div>
	);
};

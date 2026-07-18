'use client';

import { cn } from '@/lib/utils/cn';
import type { WizardStep } from './wizard-validity';

const STEPS: { step: WizardStep; label: string }[] = [
	{ step: 1, label: 'Type' },
	{ step: 2, label: 'Recipients' },
	{ step: 3, label: 'Fields' },
	{ step: 4, label: 'Summary' },
];

const dotClasses = {
	base: 'flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-colors',
	active: 'bg-primary text-primary-foreground shadow-sm',
	completed: 'bg-muted text-foreground',
	inactive: 'text-muted-foreground border',
};

type Props = {
	currentStep: WizardStep;
};

export const WizardStepIndicator = ({ currentStep }: Props) => {
	return (
		<div className="flex items-start gap-3">
			{STEPS.map(({ step, label }, index) => {
				const isActive = step === currentStep;
				const isCompleted = step < currentStep;

				return (
					<div key={step} className="flex items-start gap-3">
						<div className="flex flex-col items-center gap-1">
							<div
								className={cn(
									dotClasses.base,
									isActive && dotClasses.active,
									isCompleted && dotClasses.completed,
									!isActive && !isCompleted && dotClasses.inactive,
								)}
							>
								{step}
							</div>
							<span className="text-muted-foreground text-xs">{label}</span>
						</div>
						{index < STEPS.length - 1 && <div className="bg-muted mt-3.5 h-px w-6" />}
					</div>
				);
			})}
		</div>
	);
};

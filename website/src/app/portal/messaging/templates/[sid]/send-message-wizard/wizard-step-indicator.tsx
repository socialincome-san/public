'use client';

import { cn } from '@/lib/utils/cn';
import { Check } from 'lucide-react';
import type { WizardStep } from './validity';

export type StepMeta = { step: WizardStep; label: string };

const dotClasses = {
	base: 'flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-colors',
	active: [
		'relative isolate z-10',
		'text-primary-foreground bg-primary/90 shadow-sm',
		'after:absolute after:inset-0 after:-z-10 after:rounded-full',
		'after:bg-linear-to-r after:from-[hsl(var(--gradient-button-from))] after:to-[hsl(var(--gradient-button-to))]',
		'after:opacity-100 after:transition-opacity',
	].join(' '),
	completed: 'bg-primary/10 text-primary',
	inactive: 'text-muted-foreground border',
};

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
		<nav aria-label="Progress">
			<ol className="flex items-center">
				{steps.map((meta, index) => {
					const isActive = !allComplete && index === activeIndex;
					const isCompleted = index < activeIndex;
					const canSelect = isCompleted && onStepSelect !== undefined;

					return (
						<li key={meta.step} className={cn('flex items-center', index < steps.length - 1 && 'flex-1')}>
							<div className="flex items-center gap-2.5">
								<button
									type="button"
									disabled={!canSelect}
									aria-current={isActive ? 'step' : undefined}
									onClick={canSelect ? () => onStepSelect(meta.step) : undefined}
									className={cn(
										'flex items-center gap-2.5 rounded-full text-left',
										canSelect && 'cursor-pointer',
										!canSelect && 'cursor-default',
									)}
								>
									<span
										className={cn(
											dotClasses.base,
											isActive && dotClasses.active,
											isCompleted && dotClasses.completed,
											!isActive && !isCompleted && dotClasses.inactive,
										)}
									>
										{isCompleted ? <Check className="h-4 w-4" aria-hidden /> : index + 1}
									</span>
									<span
										className={cn(
											'hidden text-sm font-medium whitespace-nowrap transition-colors sm:inline',
											isActive ? 'text-foreground' : isCompleted ? 'text-primary' : 'text-muted-foreground',
										)}
									>
										{meta.label}
									</span>
								</button>
							</div>
							{index < steps.length - 1 && (
								<span
									aria-hidden
									className={cn('mx-3 h-px flex-1 transition-colors', index < activeIndex ? 'bg-primary/30' : 'bg-border')}
								/>
							)}
						</li>
					);
				})}
			</ol>
		</nav>
	);
};

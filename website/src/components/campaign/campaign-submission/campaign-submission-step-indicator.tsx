'use client';

import { cn } from '@/lib/utils/cn';
import type { CampaignSubmissionStepId } from './types';

const STEP_ORDER: CampaignSubmissionStepId[] = ['program', 'details', 'about'];

const circleClasses = {
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
	currentStep: CampaignSubmissionStepId;
	formStepsLabel: string;
	stepLabel: string;
	programLabel: string;
	detailsLabel: string;
	aboutLabel: string;
	variant?: 'circles' | 'bars';
	className?: string;
};

export const CampaignSubmissionStepIndicator = ({
	currentStep,
	formStepsLabel,
	stepLabel,
	programLabel,
	detailsLabel,
	aboutLabel,
	variant = 'circles',
	className,
}: Props) => {
	const activeIndex = STEP_ORDER.indexOf(currentStep);
	const stepCount = STEP_ORDER.length;

	const getStepName = (stepId: CampaignSubmissionStepId) => {
		if (stepId === 'program') {
			return programLabel;
		}

		if (stepId === 'details') {
			return detailsLabel;
		}

		return aboutLabel;
	};

	const getStepAriaLabel = (index: number) =>
		stepLabel.replace('{{number}}', String(index + 1)).replace('{{name}}', getStepName(STEP_ORDER[index]));

	if (variant === 'bars') {
		return (
			<div className={cn('flex items-center gap-2', className)} role="list" aria-label={formStepsLabel}>
				{Array.from({ length: stepCount }).map((_, index) => {
					const isActiveOrCompleted = index <= activeIndex;
					const stepNumber = index + 1;

					return (
						<div
							key={stepNumber}
							className={cn(
								'h-2 min-w-0 flex-1 rounded-full transition-colors',
								isActiveOrCompleted
									? 'bg-[linear-gradient(to_right,hsl(var(--gradient-button-from)),hsl(var(--gradient-button-to)))]'
									: 'bg-muted',
							)}
							role="listitem"
							aria-current={index === activeIndex ? 'step' : undefined}
							aria-label={getStepAriaLabel(index)}
						/>
					);
				})}
			</div>
		);
	}

	return (
		<div className={cn('flex items-center gap-3', className)} role="list" aria-label={formStepsLabel}>
			{Array.from({ length: stepCount }).map((_, index) => {
				const isActive = index === activeIndex;
				const isCompleted = index < activeIndex;
				const stepNumber = index + 1;

				return (
					<div key={stepNumber} className="flex items-center gap-3" role="listitem">
						<div
							className={cn(
								circleClasses.base,
								isActive && circleClasses.active,
								isCompleted && circleClasses.completed,
								!isActive && !isCompleted && circleClasses.inactive,
							)}
							aria-current={isActive ? 'step' : undefined}
							aria-label={getStepAriaLabel(index)}
						>
							{stepNumber}
						</div>

						{index < stepCount - 1 && <div className="bg-muted h-px w-0 md:w-6" />}
					</div>
				);
			})}
		</div>
	);
};

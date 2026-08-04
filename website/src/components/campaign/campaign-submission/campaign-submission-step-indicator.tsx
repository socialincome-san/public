'use client';

import { cn } from '@/lib/utils/cn';
import type { CampaignSubmissionStepId } from './types';

const STEP_ORDER: CampaignSubmissionStepId[] = ['program', 'details'];

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
	currentStep: CampaignSubmissionStepId;
};

export const CampaignSubmissionStepIndicator = ({ currentStep }: Props) => {
	const activeIndex = STEP_ORDER.indexOf(currentStep);
	const stepCount = STEP_ORDER.length;

	return (
		<div className="flex items-center gap-3" role="list" aria-label="Form steps">
			{Array.from({ length: stepCount }).map((_, index) => {
				const isActive = index === activeIndex;
				const isCompleted = index < activeIndex;
				const stepNumber = index + 1;

				return (
					<div key={stepNumber} className="flex items-center gap-3" role="listitem">
						<div
							className={cn(
								stepClasses.base,
								isActive && stepClasses.active,
								isCompleted && stepClasses.completed,
								!isActive && !isCompleted && stepClasses.inactive,
							)}
							aria-current={isActive ? 'step' : undefined}
							aria-label={`Step ${stepNumber}`}
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

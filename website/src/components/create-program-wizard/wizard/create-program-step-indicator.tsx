'use client';

import { cn } from '@/lib/utils/cn';
import { CreateProgramWizardState } from './types';

const STEP_COUNT = 3;

export function CreateProgramStepIndicator({ state }: { state: CreateProgramWizardState }) {
	const activeIndex = getCurrentStepIndex(state);

	return (
		<div className="flex items-center gap-3">
			{Array.from({ length: STEP_COUNT }).map((_, index) => (
				<div key={index} className="flex items-center gap-3">
					<div
						className={cn(
							'flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium',
							index === activeIndex
								? 'bg-primary text-primary-foreground'
								: index < activeIndex
									? 'bg-muted text-foreground'
									: 'text-muted-foreground border',
						)}
					>
						{index + 1}
					</div>

					{index < STEP_COUNT - 1 && <div className="bg-muted h-px w-6" />}
				</div>
			))}
		</div>
	);
}

function getCurrentStepIndex(state: CreateProgramWizardState): number {
	if (state.matches({ open: 'countrySelection' })) return 0;
	if (state.matches({ open: 'programSetup' })) return 1;
	if (state.matches({ open: 'budget' })) return 2;
	return 0;
}

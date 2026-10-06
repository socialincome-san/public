import { cva } from 'class-variance-authority';
import { Check } from 'lucide-react';
import { cn } from '../../../cn';

type StepState = 'active' | 'completed' | 'upcoming';

const dotVariants = cva('flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-colors', {
	variants: {
		state: {
			active: [
				'relative isolate z-10',
				'text-primary-foreground bg-primary/90 shadow-sm',
				'after:absolute after:inset-0 after:-z-10 after:rounded-full',
				'after:bg-linear-to-r after:from-[hsl(var(--gradient-button-from))] after:to-[hsl(var(--gradient-button-to))]',
				'after:opacity-100 after:transition-opacity',
			],
			completed: '',
			upcoming: 'text-muted-foreground border',
		},
		variant: {
			dots: '',
			labelled: '',
		},
	},
	compoundVariants: [
		{ state: 'active', variant: 'dots', className: 'hover:after:opacity-0' },
		{ state: 'completed', variant: 'dots', className: 'bg-muted text-foreground' },
		{ state: 'completed', variant: 'labelled', className: 'bg-primary/10 text-primary' },
	],
});

const labelClasses: Record<StepState, string> = {
	active: 'text-foreground',
	completed: 'text-primary',
	upcoming: 'text-muted-foreground',
};

type StepIndicatorStep = {
	// Shown next to the dot in the labelled variant, otherwise read out by screen readers
	label?: string;
};

type StepIndicatorProps = {
	steps: StepIndicatorStep[];
	// The step being edited; steps.length when all steps are done
	activeIndex: number;
	variant?: 'dots' | 'labelled' | 'bars';
	ariaLabel?: string;
	// Lets the user go back to a completed step (labelled variant)
	onStepSelect?: (index: number) => void;
};

const stepState = (index: number, activeIndex: number): StepState =>
	index === activeIndex ? 'active' : index < activeIndex ? 'completed' : 'upcoming';

export const StepIndicator = ({ steps, activeIndex, variant = 'dots', ariaLabel, onStepSelect }: StepIndicatorProps) => {
	if (variant === 'bars') {
		return (
			<div className="flex w-full items-center gap-2" role="list" aria-label={ariaLabel}>
				{steps.map((step, index) => (
					<div
						key={index}
						className={cn(
							'h-2 min-w-0 flex-1 rounded-full transition-colors',
							index <= activeIndex
								? 'bg-[linear-gradient(to_right,hsl(var(--gradient-button-from)),hsl(var(--gradient-button-to)))]'
								: 'bg-muted',
						)}
						role="listitem"
						aria-current={index === activeIndex ? 'step' : undefined}
						aria-label={step.label}
					/>
				))}
			</div>
		);
	}

	if (variant === 'dots') {
		return (
			<div className="flex items-center justify-center gap-2 sm:gap-3" role="list" aria-label={ariaLabel}>
				{steps.map((step, index) => {
					const state = stepState(index, activeIndex);

					return (
						<div key={index} className="flex items-center gap-2 sm:gap-3" role="listitem">
							<div
								className={dotVariants({ state, variant })}
								aria-current={state === 'active' ? 'step' : undefined}
								aria-label={step.label}
							>
								{index + 1}
							</div>
							{index < steps.length - 1 && <div className="bg-muted hidden h-px w-6 sm:block" />}
						</div>
					);
				})}
			</div>
		);
	}

	return (
		<nav aria-label={ariaLabel}>
			<ol className="flex items-center">
				{steps.map((step, index) => {
					const state = stepState(index, activeIndex);
					const canSelect = state === 'completed' && onStepSelect !== undefined;

					return (
						<li key={index} className={cn('flex items-center', index < steps.length - 1 && 'flex-1')}>
							<button
								type="button"
								disabled={!canSelect}
								aria-current={state === 'active' ? 'step' : undefined}
								onClick={canSelect ? () => onStepSelect(index) : undefined}
								className={cn(
									'flex items-center gap-2.5 rounded-full text-left',
									canSelect ? 'cursor-pointer' : 'cursor-default',
								)}
							>
								<span className={dotVariants({ state, variant })}>
									{state === 'completed' ? <Check className="h-4 w-4" aria-hidden /> : index + 1}
								</span>
								<span
									className={cn(
										'hidden text-sm font-medium whitespace-nowrap transition-colors sm:inline',
										labelClasses[state],
									)}
								>
									{step.label}
								</span>
							</button>
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

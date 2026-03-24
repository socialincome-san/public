import { cn } from '@socialincome/ui';

type ProgressVariant = 'default' | 'urgent';

type ProgressProps = {
	value?: number;
	variant?: ProgressVariant;
	className?: string;
};

const clampPercent = (value: number): number => {
	if (Number.isNaN(value)) {
		return 0;
	}

	return Math.min(100, Math.max(0, value));
};

const Progress = ({ className, value = 0, variant = 'default' }: ProgressProps) => {
	const indicatorClass =
		variant === 'urgent'
			? 'bg-rose-400'
			: 'bg-[linear-gradient(to_right,hsl(var(--gradient-button-from)),hsl(var(--gradient-button-to)))]';

	return (
		<div data-slot="progress" className={cn('bg-primary/20 relative h-2 w-full overflow-hidden rounded-full', className)}>
			<div
				data-slot="progress-indicator"
				className={cn('h-full transition-all', indicatorClass)}
				style={{ width: `${clampPercent(value)}%` }}
			/>
		</div>
	);
};

export { Progress };

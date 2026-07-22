import { cn } from '@/lib/utils/cn';

type ProgressVariant = 'default' | 'urgent' | 'onDark';

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
			? 'bg-destructive'
			: variant === 'onDark'
				? 'bg-white'
				: 'bg-[linear-gradient(to_right,hsl(var(--gradient-button-from)),hsl(var(--gradient-button-to)))]';
	const trackClass = variant === 'onDark' ? 'bg-white/40' : 'bg-primary/20';

	return (
		<div data-slot="progress" className={cn('relative h-2 w-full overflow-hidden rounded-full', trackClass, className)}>
			<div
				data-slot="progress-indicator"
				className={cn('h-full transition-all', indicatorClass)}
				style={{ width: `${clampPercent(value)}%` }}
			/>
		</div>
	);
};

export { Progress };

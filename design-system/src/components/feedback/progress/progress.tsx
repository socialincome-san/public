import { cva, type VariantProps } from 'class-variance-authority';

const progressVariants = cva('relative w-full overflow-hidden rounded-full', {
	variants: {
		variant: {
			default: 'bg-primary/20',
			urgent: 'bg-primary/20',
			onDark: 'bg-white/40',
		},
		size: {
			sm: 'h-1.5',
			default: 'h-2',
		},
	},
	defaultVariants: {
		variant: 'default',
		size: 'default',
	},
});

const indicatorClasses = {
	default: 'bg-[linear-gradient(to_right,hsl(var(--gradient-button-from)),hsl(var(--gradient-button-to)))]',
	urgent: 'bg-destructive',
	onDark: 'bg-white',
};

type ProgressProps = {
	value?: number;
} & VariantProps<typeof progressVariants>;

const clampPercent = (value: number): number => {
	if (Number.isNaN(value)) {
		return 0;
	}

	return Math.min(100, Math.max(0, value));
};

const Progress = ({ value = 0, variant, size }: ProgressProps) => (
	<div data-slot="progress" className={progressVariants({ variant, size })}>
		<div
			data-slot="progress-indicator"
			className={`h-full transition-all ${indicatorClasses[variant ?? 'default']}`}
			style={{ width: `${clampPercent(value)}%` }}
		/>
	</div>
);

export { Progress };

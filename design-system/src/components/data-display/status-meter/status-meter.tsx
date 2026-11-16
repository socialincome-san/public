import { cva } from 'class-variance-authority';

const dotVariants = cva('size-2 rounded-full', {
	variants: {
		status: {
			positive: 'bg-confirm',
			caution: 'bg-warning',
			negative: 'bg-destructive',
		},
	},
});

type StatusMeterProps = {
	/** One dot per check; the label names the check and shows on hover */
	items: { label: string; status: 'positive' | 'caution' | 'negative' }[];
	/** Short visible score, such as "3/4" */
	label: string;
	/** Read by screen readers instead of the dots and the label */
	description: string;
};

export const StatusMeter = ({ items, label, description }: StatusMeterProps) => (
	<span role="img" aria-label={description} className="flex items-center gap-2">
		<span className="flex items-center gap-1">
			{items.map((item) => (
				<span key={item.label} title={item.label} className={dotVariants({ status: item.status })} />
			))}
		</span>
		<span className="text-muted-foreground text-xs font-normal tabular-nums">{label}</span>
	</span>
);

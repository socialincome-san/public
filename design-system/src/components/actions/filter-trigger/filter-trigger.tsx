import { cva } from 'class-variance-authority';
import { ChevronDown } from 'lucide-react';
import * as React from 'react';
import { type WithoutClassName } from '../../../without-class-name';

// Shared with other filter-like triggers (for example MultiSelect with trigger="filter")
const filterTriggerVariants = cva(
	'border-border text-foreground hover:bg-muted data-[state=open]:bg-muted focus-visible:ring-ring flex h-10 w-full min-w-0 items-center justify-between gap-2 rounded-full border px-4 text-sm font-medium transition-colors focus-visible:ring-1 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50',
	{
		variants: {
			active: {
				true: 'bg-input hover:bg-input',
				false: 'bg-card',
			},
		},
		defaultVariants: {
			active: false,
		},
	},
);

type FilterTriggerProps = WithoutClassName<React.ButtonHTMLAttributes<HTMLButtonElement>> & {
	active?: boolean;
};

const FilterTrigger = React.forwardRef<HTMLButtonElement, FilterTriggerProps>(
	({ active, children, type = 'button', ...props }, ref) => (
		<button ref={ref} type={type} className={filterTriggerVariants({ active })} {...props}>
			<span className="min-w-0 truncate">{children}</span>
			<ChevronDown className="size-4 shrink-0 opacity-70" aria-hidden />
		</button>
	),
);
FilterTrigger.displayName = 'FilterTrigger';

export { FilterTrigger, filterTriggerVariants };

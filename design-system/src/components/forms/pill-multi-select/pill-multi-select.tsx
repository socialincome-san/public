'use client';

import { X } from 'lucide-react';
import { cn } from '../../../cn';

type Item = {
	value: string;
	label: string;
};

type Props = {
	label: string;
	items: Item[];
	selectedValues: string[];
	onToggle: (value: string) => void;
	disabled?: boolean;
	emptyLabel?: string;
	removeLabel: string;
};

const pillClasses = {
	base: 'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-sm relative z-10 transition-colors',
	active: [
		'text-primary-foreground bg-primary/90 shadow-sm',
		'after:absolute after:inset-0 after:-z-10 after:rounded-full',
		'after:bg-linear-to-r',
		'after:from-[hsl(var(--gradient-button-from))]',
		'after:to-[hsl(var(--gradient-button-to))]',
		'after:opacity-100 hover:after:opacity-0',
		'after:transition-opacity',
	],
	inactive: 'bg-background hover:bg-muted border',
};

export const PillMultiSelect = ({
	label,
	items,
	selectedValues,
	onToggle,
	disabled = false,
	emptyLabel,
	removeLabel,
}: Props) => (
	<div className="space-y-2">
		<p className="text-sm font-medium">{label}</p>
		<div className="flex flex-wrap gap-2" role="group" aria-label={label}>
			{items.length === 0 && emptyLabel ? <p className="text-muted-foreground text-sm">{emptyLabel}</p> : null}
			{items.map((item) => {
				const selected = selectedValues.includes(item.value);
				return (
					<button
						key={item.value}
						data-testid={`pill-multi-select-${item.value}`}
						type="button"
						disabled={disabled}
						onClick={() => onToggle(item.value)}
						aria-pressed={selected}
						aria-label={selected ? `${removeLabel}: ${item.label}` : item.label}
						className={cn(pillClasses.base, selected ? pillClasses.active : pillClasses.inactive)}
					>
						<span>{item.label}</span>
						{selected ? <X className="h-3.5 w-3.5" aria-hidden /> : null}
					</button>
				);
			})}
		</div>
	</div>
);

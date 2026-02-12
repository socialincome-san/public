'use client';

import { cn } from '@/lib/utils/cn';
import { X } from 'lucide-react';

type PillMultiSelectProps = {
	label: string;
	values: string[];
	selected?: string[];
	onToggle: (value: string) => void;
};

function humanize(value: string) {
	return value.replace(/_/g, ' ');
}

const pillClasses = {
	base: 'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-sm relative z-10 transition-colors',
	active: [
		'text-primary-foreground bg-primary/90 shadow',
		'after:absolute after:inset-0 after:-z-10 after:rounded-full',
		'after:bg-gradient-to-r',
		'after:from-[hsl(var(--gradient-button-from))]',
		'after:to-[hsl(var(--gradient-button-to))]',
		'after:opacity-100 hover:after:opacity-0',
		'after:transition-opacity',
	],
	inactive: 'bg-background hover:bg-muted border',
};

export function PillMultiSelect({ label, values, selected = [], onToggle }: PillMultiSelectProps) {
	return (
		<div className="space-y-2">
			<p className="text-sm font-medium">{label}</p>

			<div className="flex flex-wrap gap-2" role="group" aria-label={label}>
				{values.map((value) => {
					const isActive = selected.includes(value);

					return (
						<button
							data-testid={`pill-multi-select-${value}`}
							key={value}
							type="button"
							onClick={() => onToggle(value)}
							aria-pressed={isActive}
							className={cn(pillClasses.base, isActive ? pillClasses.active : pillClasses.inactive)}
						>
							<span>{humanize(value)}</span>
							{isActive && <X className="h-3.5 w-3.5" aria-hidden />}
						</button>
					);
				})}
			</div>
		</div>
	);
}

'use client';

import { X } from 'lucide-react';
import { cn } from '../../../cn';

export type PillMultiSelectItem = {
	value: string;
	label: string;
};

type PillMultiSelectProps = {
	label: string;
	items: PillMultiSelectItem[];
	selectedValues: string[];
	onToggle: (value: string) => void;
	emptyLabel?: string;
	disabled?: boolean;
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
	emptyLabel,
	disabled = false,
}: PillMultiSelectProps) => {
	return (
		<div className="space-y-2">
			<p className="text-sm font-medium">{label}</p>

			{items.length === 0 ? (
				emptyLabel ? (
					<p className="text-muted-foreground text-sm">{emptyLabel}</p>
				) : null
			) : (
				<div className="flex flex-wrap gap-2" role="group" aria-label={label}>
					{items.map((item) => {
						const isActive = selectedValues.includes(item.value);

						return (
							<button
								data-testid={`pill-multi-select-${item.value}`}
								key={item.value}
								type="button"
								disabled={disabled}
								onClick={() => onToggle(item.value)}
								aria-pressed={isActive}
								className={cn(
									pillClasses.base,
									isActive ? pillClasses.active : pillClasses.inactive,
									disabled && 'cursor-not-allowed opacity-50',
								)}
							>
								<span>{item.label}</span>
								{isActive && <X className="h-3.5 w-3.5" aria-hidden />}
							</button>
						);
					})}
				</div>
			)}
		</div>
	);
};

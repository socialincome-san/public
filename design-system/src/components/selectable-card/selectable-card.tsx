'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import type { ReactNode } from 'react';

const selectableCardVariants = cva('text-foreground w-full min-w-0 rounded-[10px] border transition-colors', {
	variants: {
		size: {
			default: 'p-4 text-left',
			// A short centred label, e.g. one option of a small choice
			sm: 'px-4 py-3 text-center text-sm font-medium',
		},
		state: {
			selected: 'border-ring bg-muted/50',
			idle: 'border-border bg-card hover:bg-muted/50',
			disabled: 'border-border bg-card cursor-not-allowed opacity-60',
		},
	},
	defaultVariants: {
		size: 'default',
	},
});

type Props = {
	selected: boolean;
	onSelect: () => void;
	disabled?: boolean;
	children: ReactNode;
	testId?: string;
} & Pick<VariantProps<typeof selectableCardVariants>, 'size'>;

export const SelectableCard = ({ selected, onSelect, disabled = false, size, children, testId }: Props) => (
	<button
		type="button"
		data-testid={testId}
		aria-pressed={selected}
		disabled={disabled}
		onClick={onSelect}
		className={selectableCardVariants({
			size,
			state: disabled ? 'disabled' : selected ? 'selected' : 'idle',
		})}
	>
		{children}
	</button>
);

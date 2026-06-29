'use client';

import { cn } from '@/lib/utils/cn';
import type { ReactNode } from 'react';

type Props = {
	selected: boolean;
	onSelect: () => void;
	disabled?: boolean;
	className?: string;
	children: ReactNode;
	testId?: string;
};

export const SelectableCard = ({ selected, onSelect, disabled = false, className, children, testId }: Props) => (
	<button
		type="button"
		data-testid={testId}
		aria-pressed={selected}
		disabled={disabled}
		onClick={onSelect}
		className={cn(
			'text-foreground rounded-[10px] border text-left transition-colors',
			selected ? 'border-ring bg-muted/50' : 'border-border bg-card',
			disabled && 'cursor-not-allowed opacity-60',
			className,
		)}
	>
		{children}
	</button>
);

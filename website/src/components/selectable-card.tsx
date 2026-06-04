'use client';

import { cn } from '@/lib/utils/cn';
import type { ReactNode } from 'react';

type Props = {
	selected: boolean;
	onSelect: () => void;
	className?: string;
	children: ReactNode;
};

export const SelectableCard = ({ selected, onSelect, className, children }: Props) => (
	<button
		type="button"
		aria-pressed={selected}
		onClick={onSelect}
		className={cn(
			'rounded-[10px] border text-left transition-colors',
			selected ? 'border-slate-500 bg-slate-50' : 'border-border bg-white',
			className,
		)}
	>
		{children}
	</button>
);

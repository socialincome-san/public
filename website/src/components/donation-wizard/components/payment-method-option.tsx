'use client';

import { cn } from '@/lib/utils/cn';
import { Smile } from 'lucide-react';
import type { ReactNode } from 'react';

type Props = {
	label: string;
	selected: boolean;
	onSelect: () => void;
	badge?: string;
	trailing?: ReactNode;
};

export const PaymentMethodOption = ({ label, selected, onSelect, badge, trailing }: Props) => (
	<button
		type="button"
		aria-pressed={selected}
		onClick={onSelect}
		className={cn(
			'flex w-full flex-col gap-3 rounded-[10px] border p-3 text-left transition-colors sm:h-16 sm:flex-row sm:items-center sm:p-4',
			selected ? 'border-slate-500 bg-slate-50' : 'border-border bg-white hover:bg-slate-50/50',
		)}
	>
		<div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
			<div className="flex min-w-0 flex-wrap items-center gap-2">
				<span className="text-base leading-snug font-medium sm:text-lg sm:leading-none">{label}</span>
				{badge && (
					<span className="inline-flex shrink-0 items-center gap-0.5 rounded-full border border-green-300 bg-green-100 px-2 py-0.5 text-[10px] font-medium">
						{badge}
						<Smile className="size-2.5" aria-hidden />
					</span>
				)}
			</div>
			{trailing && <div className="flex shrink-0 items-center justify-start sm:justify-end">{trailing}</div>}
		</div>
	</button>
);

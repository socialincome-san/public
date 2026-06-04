'use client';

import { Badge } from '@/components/badge';
import { SelectableCard } from '@/components/selectable-card';
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
	<SelectableCard
		selected={selected}
		onSelect={onSelect}
		className={cn(
			'flex w-full flex-col gap-3 p-3 sm:h-16 sm:flex-row sm:items-center sm:p-4',
			!selected && 'hover:bg-slate-50/50',
		)}
	>
		<div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
			<div className="flex min-w-0 flex-wrap items-center gap-2">
				<span className="text-base leading-snug font-medium sm:text-lg sm:leading-none">{label}</span>
				{badge && (
					<Badge variant="verified" className="shrink-0 gap-0.5 px-2 py-0.5 text-[10px]">
						{badge}
						<Smile className="size-2.5" aria-hidden />
					</Badge>
				)}
			</div>
			{trailing && <div className="flex shrink-0 items-center justify-start sm:justify-end">{trailing}</div>}
		</div>
	</SelectableCard>
);

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
	disabled?: boolean;
	disabledReason?: string;
	badge?: string;
	trailing?: ReactNode;
	testId: string;
};

export const PaymentMethodOption = ({
	label,
	selected,
	onSelect,
	disabled = false,
	disabledReason,
	badge,
	trailing,
	testId,
}: Props) => (
	<SelectableCard
		selected={selected}
		onSelect={onSelect}
		disabled={disabled}
		testId={testId}
		className={cn(
			'flex w-full flex-col gap-3 p-3 sm:h-16 sm:flex-row sm:items-center sm:p-4',
			!selected && !disabled && 'hover:bg-muted/50',
		)}
	>
		<div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
			<div className="flex min-w-0 flex-1 flex-col gap-1">
				<div className="flex min-w-0 flex-wrap items-center gap-2">
					<span className="text-base leading-snug font-medium sm:text-lg sm:leading-none">{label}</span>
					{badge && (
						<Badge variant="verified" className="shrink-0 gap-0.5 px-2 py-0.5 text-[10px]">
							{badge}
							<Smile className="size-2.5" aria-hidden />
						</Badge>
					)}
				</div>
				{disabledReason ? <p className="text-muted-foreground text-sm leading-snug">{disabledReason}</p> : null}
			</div>
			{trailing && <div className="flex shrink-0 items-center justify-start sm:justify-end">{trailing}</div>}
		</div>
	</SelectableCard>
);

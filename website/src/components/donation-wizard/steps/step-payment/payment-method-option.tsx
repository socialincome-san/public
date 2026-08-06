'use client';

import { Badge } from '@/components/badge';
import { SelectableCard } from '@/components/selectable-card';
import { cn } from '@/lib/utils/cn';
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
			'flex w-full min-w-0 max-w-full flex-col gap-2 p-3 sm:min-h-16 sm:justify-center sm:p-4',
			!selected && !disabled && 'hover:bg-muted/50',
		)}
	>
		<div className="flex w-full min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-2">
			<div className="flex min-w-0 flex-col gap-1">
				<div className="flex min-w-0 flex-wrap items-center gap-2">
					<span className="text-base leading-snug font-medium sm:text-lg sm:leading-none">{label}</span>
					{badge && (
						<Badge variant="verified" className="shrink-0 gap-0.5 px-2 py-0.5 text-[10px]">
							{badge}
						</Badge>
					)}
				</div>
				{disabledReason ? (
					<p className="text-muted-foreground min-w-0 text-sm leading-snug break-words">{disabledReason}</p>
				) : null}
			</div>
			{trailing ? <div className="min-w-0 max-w-full">{trailing}</div> : null}
		</div>
	</SelectableCard>
);

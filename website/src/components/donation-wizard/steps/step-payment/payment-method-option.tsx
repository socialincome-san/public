'use client';

import { Badge } from '@socialincome/design-system/data-display/badge/badge';
import { SelectableCard } from '@socialincome/design-system/forms/selectable-card/selectable-card';
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
	<SelectableCard selected={selected} onSelect={onSelect} disabled={disabled} testId={testId}>
		<div className="flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-2 sm:min-h-8">
			<div className="flex min-w-0 flex-col gap-1">
				<div className="flex min-w-0 flex-wrap items-center gap-2">
					<span className="text-base leading-snug font-medium sm:text-lg sm:leading-none">{label}</span>
					{badge && (
						<Badge variant="verified" size="sm">
							{badge}
						</Badge>
					)}
				</div>
				{disabledReason ? (
					<p className="text-muted-foreground min-w-0 text-sm leading-snug break-words">{disabledReason}</p>
				) : null}
			</div>
			{trailing ? <div className="max-w-full min-w-0">{trailing}</div> : null}
		</div>
	</SelectableCard>
);

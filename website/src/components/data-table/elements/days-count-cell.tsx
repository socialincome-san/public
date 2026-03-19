'use client';

import { Badge } from '@/components/badge';
import { CellType } from '@/components/data-table/elements/types';
import { Clock3Icon } from 'lucide-react';

const formatDaysUntilStart = (days: number): string => {
	if (days <= 0) {
		return 'Today';
	}

	return `In ${days} day${days === 1 ? '' : 's'}`;
};

export const DaysCountCell = <TData, TValue>({ ctx }: CellType<TData, TValue>) => {
	const rawValue = ctx.getValue();
	const days = typeof rawValue === 'number' ? rawValue : Number(rawValue ?? 0);
	const safeDays = Number.isFinite(days) ? Math.max(0, Math.floor(days)) : 0;
	let badgeVariant: 'default' | 'secondary' | 'outline' | 'destructive' | 'verified' = 'verified';

	if (safeDays < 7) {
		badgeVariant = 'destructive';
	} else if (safeDays < 14) {
		badgeVariant = 'secondary';
	} else if (safeDays < 30) {
		badgeVariant = 'outline';
	} else if (safeDays < 60) {
		badgeVariant = 'default';
	}

	return (
		<Badge variant={badgeVariant}>
			<Clock3Icon className="mr-1 h-4 w-4" />
			{formatDaysUntilStart(safeDays)}
		</Badge>
	);
};

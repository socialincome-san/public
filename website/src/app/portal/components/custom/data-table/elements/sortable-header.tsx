'use client';

import { Button } from '@/app/portal/components/ui/button';
import { ArrowUpDown } from 'lucide-react';
import { HeaderType } from './types';

export function SortableHeader<TData, TValue>({ ctx, children }: HeaderType<TData, TValue>) {
	const { column } = ctx;

	return (
		<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
			{children}
			<ArrowUpDown className="ml-2 h-4 w-4" focusable="false" />
		</Button>
	);
}

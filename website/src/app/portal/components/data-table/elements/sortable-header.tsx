'use client';

import { Button } from '@/app/portal/components/button';
import { ChevronDownIcon, ChevronsUpDownIcon, ChevronUpIcon } from 'lucide-react';
import { HeaderType } from './types';

export function SortableHeader<TData, TValue>({ ctx, children }: HeaderType<TData, TValue>) {
	const { column } = ctx;
	const isSorted = column.getIsSorted();

	return (
		<Button
			variant="ghost"
			onClick={() => column.toggleSorting(isSorted === 'asc')}
			className="inline-flex h-auto items-center p-0 text-left"
		>
			{children}

			{isSorted === 'asc' && <ChevronUpIcon className="ml-2 h-4 w-4 shrink-0" aria-hidden />}
			{isSorted === 'desc' && <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0" aria-hidden />}
			{!isSorted && <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-40" aria-hidden />}
		</Button>
	);
}

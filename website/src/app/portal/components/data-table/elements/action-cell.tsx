'use client';

import { CellType } from '@/app/portal/components/data-table/elements/types';
import { ChevronRightIcon } from 'lucide-react';

export function ActionCell<TData, TValue>({}: CellType<TData, TValue>) {
	return (
		<div className="flex items-center justify-center opacity-70" aria-hidden="true">
			<ChevronRightIcon className="h-5 w-5 transition-transform duration-200 ease-out group-hover:translate-x-1" />
		</div>
	);
}

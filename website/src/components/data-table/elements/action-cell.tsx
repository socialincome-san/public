'use client';

import { CellType } from '@/components/data-table/elements/types';
import { ChevronRightIcon } from 'lucide-react';

type ActionCellProps<TData, TValue> = CellType<TData, TValue>;

export const ActionCell = <TData, TValue>({ ctx }: ActionCellProps<TData, TValue>) => {
	void ctx;

	return (
		<div className="flex items-center justify-center opacity-70" aria-hidden="true" data-testid="action-cell-icon">
			<ChevronRightIcon className="h-5 w-5 transition-transform duration-200 ease-out group-hover:translate-x-1" />
		</div>
	);
};

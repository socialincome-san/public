'use client';

import { CellType } from '@/components/data-table/elements/types';
import { EyeIcon, PenLineIcon } from 'lucide-react';

type ActionCellMode = 'edit' | 'view';

type ActionCellProps<TData, TValue> = CellType<TData, TValue> & {
	mode?: ActionCellMode;
};

export const ActionCell = <TData, TValue>({ ctx, mode = 'edit' }: ActionCellProps<TData, TValue>) => {
	void ctx;

	const icon =
		mode === 'view' ? (
			<EyeIcon className="h-5 w-5 transition-transform duration-200 ease-out group-hover:translate-x-1" />
		) : (
			<PenLineIcon className="h-5 w-5 transition-transform duration-200 ease-out group-hover:translate-x-1" />
		);

	return (
		<div className="flex items-center justify-center opacity-70" aria-hidden="true" data-testid={`action-cell-icon-${mode}`}>
			{icon}
		</div>
	);
};

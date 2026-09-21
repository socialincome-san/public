import type { CellContext, HeaderContext } from '@/components/data-table/tanstack-table';
import type { RowData } from '@tanstack/react-table';
import { ReactNode } from 'react';

export type CellType<TData extends RowData, TValue> = {
	ctx: CellContext<TData, TValue>;
};

export type HeaderType<TData extends RowData, TValue> = {
	ctx: HeaderContext<TData, TValue>;
	children: ReactNode;
};

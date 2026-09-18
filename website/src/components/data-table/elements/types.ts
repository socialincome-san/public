import type { CellContext, HeaderContext } from '@/components/data-table/tanstack-table';
import { ReactNode } from 'react';

export type CellType<TData, TValue> = {
	ctx: CellContext<TData, TValue>;
};

export type HeaderType<TData, TValue> = {
	ctx: HeaderContext<TData, TValue>;
	children: ReactNode;
};

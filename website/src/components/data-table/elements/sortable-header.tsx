'use client';

import type { RowData } from '@tanstack/react-table';
import { HeaderType } from './types';

export const SortableHeader = <TData extends RowData, TValue>({ ctx, children }: HeaderType<TData, TValue>) => {
	void ctx;

	return <span>{children}</span>;
};

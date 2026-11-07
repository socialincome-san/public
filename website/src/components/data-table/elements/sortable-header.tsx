'use client';

import { Button } from '@socialincome/design-system/actions/button/button';
import type { RowData } from '@tanstack/react-table';
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon } from 'lucide-react';
import { HeaderType } from './types';

type Props<TData extends RowData, TValue> = HeaderType<TData, TValue> & {
	sortable?: boolean;
};

export const SortableHeader = <TData extends RowData, TValue>({ ctx, children, sortable = false }: Props<TData, TValue>) => {
	if (!sortable || !ctx.column.getCanSort()) {
		return <span>{children}</span>;
	}

	const sorted = ctx.column.getIsSorted();
	const SortIcon = sorted === 'asc' ? ArrowUpIcon : sorted === 'desc' ? ArrowDownIcon : ArrowUpDownIcon;

	return (
		<Button
			type="button"
			variant="ghost"
			size="inline"
			onClick={ctx.column.getToggleSortingHandler()}
			aria-pressed={Boolean(sorted)}
			title="Sort"
			data-testid={`data-table-sort-header-${ctx.column.id}`}
		>
			{children}
			<SortIcon aria-hidden="true" />
		</Button>
	);
};

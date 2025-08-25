// app/portal/components/data-table/data-table.tsx
'use client';

import { BaseTable } from '@/app/portal/components/data-table/elements/base-table';
import type { ColumnDef } from '@tanstack/react-table';
import { ReactNode } from 'react';

type DataTableProps<Row> = {
	title: ReactNode;
	error?: string | null;
	emptyMessage: string;
	actions?: ReactNode;
	data: Row[];
	makeColumns: (hideProgramName: boolean) => ColumnDef<Row>[];
	hideProgramName?: boolean;
	onRowClick?: (row: Row) => void;
};

export default function DataTable<Row>({
	title,
	error,
	emptyMessage,
	actions,
	data,
	makeColumns,
	hideProgramName = false,
	onRowClick,
}: DataTableProps<Row>) {
	const columns = makeColumns(hideProgramName);
	const isEmpty = data.length === 0;

	return (
		<div>
			<div className="mb-4 flex items-center justify-between">
				<h2 className="pb-4 text-3xl">
					{title} <span className="text-lg text-gray-500">({data.length})</span>
				</h2>
				{actions ?? null}
			</div>

			{error ? (
				<div className="p-4 text-red-600">Error: {error}</div>
			) : isEmpty ? (
				<div className="p-4 text-gray-500">{emptyMessage}</div>
			) : (
				<BaseTable data={data} columns={columns} onRowClick={onRowClick} />
			)}
		</div>
	);
}

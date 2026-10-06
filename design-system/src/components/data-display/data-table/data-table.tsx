import type { ReactNode } from 'react';
import { cn } from '../../../cn';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../table/table';

export const dataTableStableMinHeight = 'min-h-[680px] md:min-h-[760px]';

export type DataTableCell = {
	id: string;
	content: ReactNode;
};

export type DataTableHeaderRow = {
	id: string;
	cells: DataTableCell[];
};

export type DataTableRow = {
	id: string;
	cells: DataTableCell[];
	onClick?: () => void;
};

type DataTableProps = {
	headerRows: DataTableHeaderRow[];
	rows: DataTableRow[];
	columnCount: number;
	emptyMessage: ReactNode;
	/** Reserves the height of a full page so paging does not shift the layout */
	stableHeight?: boolean;
	pagination?: ReactNode;
};

export const DataTable = ({
	headerRows,
	rows,
	columnCount,
	emptyMessage,
	stableHeight = true,
	pagination,
}: DataTableProps) => (
	<div className={cn('flex flex-col', stableHeight && dataTableStableMinHeight)} data-testid="data-table-base">
		<div className="overflow-hidden rounded-none">
			<Table size="lg">
				<TableHeader>
					{headerRows.map((headerRow) => (
						<TableRow key={headerRow.id}>
							{headerRow.cells.map((cell) => (
								<TableHead key={cell.id}>{cell.content}</TableHead>
							))}
						</TableRow>
					))}
				</TableHeader>
				<TableBody>
					{rows.length ? (
						rows.map((row) => (
							<TableRow key={row.id} onClick={row.onClick}>
								{row.cells.map((cell) => (
									<TableCell key={cell.id}>{cell.content}</TableCell>
								))}
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell colSpan={columnCount}>
								<div className="text-center">{emptyMessage}</div>
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
		{pagination}
	</div>
);

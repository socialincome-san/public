'use client';

import { Button } from '../../actions/button/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../forms/select/select';

type DataTablePaginationProps = {
	startRow: number;
	endRow: number;
	totalRows: number;
	canPreviousPage: boolean;
	canNextPage: boolean;
	onPreviousPage: () => void;
	onNextPage: () => void;
	pageSize: number;
	pageSizeOptions: number[];
	onPageSizeChange: (pageSize: number) => void;
	showRowsPerPageSelector?: boolean;
};

export const DataTablePagination = ({
	startRow,
	endRow,
	totalRows,
	canPreviousPage,
	canNextPage,
	onPreviousPage,
	onNextPage,
	pageSize,
	pageSizeOptions,
	onPageSizeChange,
	showRowsPerPageSelector = true,
}: DataTablePaginationProps) => (
	<div className="mt-auto flex items-center justify-between gap-4 py-4" data-testid="data-table-pagination">
		<div className="flex items-center gap-2">
			{showRowsPerPageSelector ? (
				<>
					<span className="text-muted-foreground text-sm">Rows per page</span>
					<Select value={`${pageSize}`} onValueChange={(value) => onPageSizeChange(Number(value))}>
						<div className="w-20">
							<SelectTrigger size="sm" data-testid="data-table-page-size-trigger">
								<SelectValue />
							</SelectTrigger>
						</div>
						<SelectContent>
							{pageSizeOptions.map((size) => (
								<SelectItem key={size} value={`${size}`}>
									{size}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</>
			) : null}
		</div>

		<div className="flex items-center gap-4">
			<Button
				variant="outline"
				size="sm"
				onClick={onPreviousPage}
				disabled={!canPreviousPage}
				data-testid="data-table-pagination-previous"
			>
				Previous
			</Button>
			<span className="text-muted-foreground text-sm" data-testid="data-table-pagination-range">
				{startRow}-{endRow} of {totalRows}
			</span>
			<Button
				variant="outline"
				size="sm"
				onClick={onNextPage}
				disabled={!canNextPage}
				data-testid="data-table-pagination-next"
			>
				Next
			</Button>
		</div>
	</div>
);

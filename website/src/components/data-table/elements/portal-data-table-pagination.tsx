'use client';

import { usePortalSharedTranslations } from '@/components/portal-shared-translations';
import { Button } from '@socialincome/design-system/actions/button/button';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@socialincome/design-system/forms/select/select';

type Props = {
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

export const PortalDataTablePagination = ({
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
}: Props) => {
	const { t } = usePortalSharedTranslations();

	return (
		<div className="mt-auto flex items-center justify-between gap-4 py-4" data-testid="data-table-pagination">
			<div className="flex items-center gap-2">
				{showRowsPerPageSelector ? (
					<>
						<span className="text-muted-foreground text-sm">{t('table.rowsPerPage', 'Rows per page')}</span>
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
					{t('table.previous', 'Previous')}
				</Button>
				<span className="text-muted-foreground text-sm" data-testid="data-table-pagination-range">
					{startRow}-{endRow} {t('table.of', 'of')} {totalRows}
				</span>
				<Button
					variant="outline"
					size="sm"
					onClick={onNextPage}
					disabled={!canNextPage}
					data-testid="data-table-pagination-next"
				>
					{t('table.next', 'Next')}
				</Button>
			</div>
		</div>
	);
};

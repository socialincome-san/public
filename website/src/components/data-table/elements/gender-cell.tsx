import { CellType } from '@/components/data-table/elements/types';
import { type Gender } from '@/generated/prisma/enums';
import { DataTableGenderCell } from '@socialincome/design-system/data-display/data-table-cells/data-table-cells';
import type { RowData } from '@tanstack/react-table';

export const GenderCell = <TData extends RowData, TValue>({ ctx }: CellType<TData, TValue>) => (
	<DataTableGenderCell gender={ctx.getValue() as Gender | null} />
);

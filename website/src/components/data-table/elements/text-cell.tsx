import { CellType } from '@/components/data-table/elements/types';
import { OBFUSCATED_SENTINEL } from '@/modules/recipients/recipient.types';
import { DataTableTextCell } from '@socialincome/design-system/data-display/data-table-cells/data-table-cells';
import type { RowData } from '@tanstack/react-table';

type Props<TData extends RowData, TValue> = CellType<TData, TValue> & {
	translatedValue?: string;
};

export const TextCell = <TData extends RowData, TValue>({ ctx, translatedValue }: Props<TData, TValue>) => {
	const value = ctx.getValue();
	const raw = !value ? '' : String(translatedValue ?? value);

	return <DataTableTextCell value={raw} obfuscated={raw === OBFUSCATED_SENTINEL} />;
};

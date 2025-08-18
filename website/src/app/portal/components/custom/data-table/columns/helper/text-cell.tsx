import { CellType } from '@/app/portal/components/custom/data-table/columns/helper/types';

export function TextCell<TData, TValue>({ ctx }: CellType<TData, TValue>) {
	const value = ctx.getValue();

	return <span>{value == null ? '—' : String(value)}</span>;
}

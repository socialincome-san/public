import { CellType } from '@/app/portal/components/custom/data-table/elements/types';

export function TextCell<TData, TValue>({ ctx }: CellType<TData, TValue>) {
	const value = ctx.getValue();

	return <span>{value == null ? '—' : String(value)}</span>;
}

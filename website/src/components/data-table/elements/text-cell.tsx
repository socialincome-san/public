import { CellType } from '@/components/data-table/elements/types';

export function TextCell<TData, TValue>({ ctx }: CellType<TData, TValue>) {
	const value = ctx.getValue();

	return <span>{!value ? '—' : String(value)}</span>;
}

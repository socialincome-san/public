import { CellType } from '@/app/portal/components/data-table/elements/types';

export function AgeCell<TData, TValue>({ ctx }: CellType<TData, TValue>) {
	const value = ctx.getValue();
	const today = new Date();

	if (!(value instanceof Date)) {
		return <span>{!value ? '—' : String(value)}</span>;
	}

	let years = today.getFullYear() - value.getFullYear();
	const monthDifference = today.getMonth() - value.getMonth();
	const dayDifference = today.getDate() - value.getDate();
	if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
		years -= 1;
	}

	return years;
}

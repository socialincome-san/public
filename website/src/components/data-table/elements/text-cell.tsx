import { CellType } from '@/components/data-table/elements/types';

type Props<TData, TValue> = CellType<TData, TValue> & {
	translatedValue?: string;
};

export function TextCell<TData, TValue>({ ctx, translatedValue }: Props<TData, TValue>) {
	const value = ctx.getValue();

	return <span>{!value ? '—' : String(translatedValue || value)}</span>;
}

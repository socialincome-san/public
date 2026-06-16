import { CellType } from '@/components/data-table/elements/types';
import { cn } from '@/lib/utils/cn';
import { OBFUSCATED_SENTINEL } from '@/lib/utils/obfuscation';

type Props<TData, TValue> = CellType<TData, TValue> & {
	translatedValue?: string;
};

export const TextCell = <TData, TValue>({ ctx, translatedValue }: Props<TData, TValue>) => {
	const value = ctx.getValue();
	const raw = !value ? '' : String(translatedValue ?? value);
	const isObfuscated = raw === OBFUSCATED_SENTINEL;

	return (
		<span className={cn('inline-block', isObfuscated && 'px-1 blur-[6px] saturate-150 select-none')}>
			{raw.length === 0 ? '—' : raw}
		</span>
	);
};

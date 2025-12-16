import { CellType } from '@/components/data-table/elements/types';
import { Coins, CreditCard } from 'lucide-react';

type Props<TData, TValue> = CellType<TData, TValue> & {
	variant: 'card' | 'other';
};

export function PaymentMethodCell<TData, TValue>({ ctx, variant }: Props<TData, TValue>) {
	const value = ctx.getValue();

	return (
		<span className="flex items-center gap-2">
			{variant === 'card' ? <CreditCard /> : <Coins />}
			{String(value)}
		</span>
	);
}

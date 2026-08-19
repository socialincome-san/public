import type { Currency } from '@/generated/prisma/enums';

export type PayoutPerIntervalAmountProps = {
	payoutPerInterval: number;
	payoutCurrency: Currency;
	displayCurrency: Currency;
	payoutToDisplayRate?: number;
};

export const PayoutPerIntervalAmount = ({
	payoutPerInterval,
	payoutCurrency,
	displayCurrency,
	payoutToDisplayRate,
}: PayoutPerIntervalAmountProps) => {
	const converted =
		payoutToDisplayRate !== undefined && payoutCurrency !== displayCurrency
			? Math.round(payoutPerInterval * payoutToDisplayRate)
			: undefined;

	return (
		<span data-testid="payout-per-interval-amount" className="flex items-baseline gap-2 tabular-nums">
			<span className="font-medium">
				{payoutCurrency} {payoutPerInterval.toLocaleString('de-CH')}
			</span>
			{converted !== undefined && (
				<span className="text-muted-foreground">
					{displayCurrency} {converted.toLocaleString('de-CH')}
				</span>
			)}
		</span>
	);
};

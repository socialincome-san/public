'use client';

import { Switch } from '@/components/switch/switch';
import { PayoutInterval } from '@/generated/prisma/enums';
import { useRouteTranslator } from '@/lib/hooks/use-route-translator';
import { PayoutControls } from './payout-controls';
import { type PayoutPerIntervalAmountProps } from './payout-per-interval-amount';
import { PayoutSummary } from './payout-summary';

type Props = {
	programDuration: number;
	payoutPerIntervalMin: number;
	payoutPerIntervalMax: number;
	payoutInterval: PayoutInterval;
	customizePayouts: boolean;
	onDurationChange: (value: number) => void;
	onPayoutChange: (value: number) => void;
	onIntervalChange: (value: PayoutInterval) => void;
	onToggleCustomizePayouts: () => void;
} & PayoutPerIntervalAmountProps;

export const PayoutBox = ({
	programDuration,
	payoutPerIntervalMin,
	payoutPerIntervalMax,
	payoutPerInterval,
	payoutInterval,
	payoutCurrency,
	displayCurrency,
	payoutToDisplayRate,
	customizePayouts,
	onDurationChange,
	onPayoutChange,
	onIntervalChange,
	onToggleCustomizePayouts,
}: Props) => {
	const { t } = useRouteTranslator({ namespace: 'create-program-wizard' });

	return (
		<div className="flex h-full flex-col rounded-xl border p-8">
			<h3 className="font-medium">{t('step3.payouts.title')}</h3>

			<div className="mt-6">
				{customizePayouts ? (
					<PayoutControls
						programDuration={programDuration}
						payoutPerIntervalMin={payoutPerIntervalMin}
						payoutPerIntervalMax={payoutPerIntervalMax}
						payoutPerInterval={payoutPerInterval}
						payoutInterval={payoutInterval}
						payoutCurrency={payoutCurrency}
						displayCurrency={displayCurrency}
						payoutToDisplayRate={payoutToDisplayRate}
						onDurationChange={onDurationChange}
						onPayoutChange={onPayoutChange}
						onIntervalChange={onIntervalChange}
					/>
				) : (
					<PayoutSummary
						programDuration={programDuration}
						payoutPerInterval={payoutPerInterval}
						payoutInterval={payoutInterval}
						payoutCurrency={payoutCurrency}
						displayCurrency={displayCurrency}
						payoutToDisplayRate={payoutToDisplayRate}
					/>
				)}
			</div>

			<div className="flex items-center gap-3 pt-6">
				<Switch
					data-testid="customize-payouts-switch"
					checked={customizePayouts}
					onCheckedChange={onToggleCustomizePayouts}
				/>
				<span className="text-sm font-medium">{t('step3.payouts.customize')}</span>
			</div>
		</div>
	);
};

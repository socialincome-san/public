'use client';

import { Switch } from '@/components/switch';
import { PayoutInterval } from '@/generated/prisma/enums';
import { useRouteTranslator } from '@/lib/hooks/use-route-translator';
import { PayoutControls } from './payout-controls';
import { PayoutSummary } from './payout-summary';

export const PayoutBox = ({
	programDuration,
	payoutPerIntervalMin,
	payoutPerIntervalMax,
	payoutPerInterval,
	payoutInterval,
	currency,
	customizePayouts,
	onDurationChange,
	onPayoutChange,
	onIntervalChange,
	onToggleCustomizePayouts,
}: {
	programDuration: number;
	payoutPerIntervalMin: number;
	payoutPerIntervalMax: number;
	payoutPerInterval: number;
	payoutInterval: PayoutInterval;
	currency: string;
	customizePayouts: boolean;
	onDurationChange: (value: number) => void;
	onPayoutChange: (value: number) => void;
	onIntervalChange: (value: PayoutInterval) => void;
	onToggleCustomizePayouts: () => void;
}) => {
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
						currency={currency}
						onDurationChange={onDurationChange}
						onPayoutChange={onPayoutChange}
						onIntervalChange={onIntervalChange}
					/>
				) : (
					<PayoutSummary
						programDuration={programDuration}
						payoutPerInterval={payoutPerInterval}
						payoutInterval={payoutInterval}
						currency={currency}
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

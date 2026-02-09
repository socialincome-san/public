'use client';

import { Switch } from '@/components/switch';
import { PayoutInterval } from '@/generated/prisma/enums';
import { PayoutControls } from './payout-controls';
import { PayoutSummary } from './payout-summary';

export function PayoutBox({
	programDuration,
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
	payoutPerInterval: number;
	payoutInterval: PayoutInterval;
	currency: string;
	customizePayouts: boolean;
	onDurationChange: (value: number) => void;
	onPayoutChange: (value: number) => void;
	onIntervalChange: (value: PayoutInterval) => void;
	onToggleCustomizePayouts: () => void;
}) {
	return (
		<div className="flex h-full flex-col rounded-xl border p-8">
			<h3 className="font-medium">Payouts</h3>

			<div className="mt-6">
				{customizePayouts ? (
					<PayoutControls
						programDuration={programDuration}
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
				<Switch checked={customizePayouts} onCheckedChange={onToggleCustomizePayouts} />
				<span className="text-sm font-medium">Customize</span>
			</div>
		</div>
	);
}

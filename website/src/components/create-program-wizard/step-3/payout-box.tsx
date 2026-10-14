'use client';

import { PayoutInterval } from '@/generated/prisma/enums';
import { Switch } from '@socialincome/design-system/forms/switch/switch';
import { useTranslations } from 'next-intl';
import { PayoutControls } from './payout-controls';
import { type PayoutPerIntervalAmountProps } from './payout-per-interval-amount';
import { PayoutSummary } from './payout-summary';

export type PayoutCustomization = {
	enabled: boolean;
	payoutPerIntervalMin: number;
	payoutPerIntervalMax: number;
	onToggle: () => void;
	onDurationChange: (value: number) => void;
	onPayoutChange: (value: number) => void;
	onIntervalChange: (value: PayoutInterval) => void;
};

type Props = {
	programDuration: number;
	payoutInterval: PayoutInterval;
	customization?: PayoutCustomization;
} & PayoutPerIntervalAmountProps;

export const PayoutBox = ({
	programDuration,
	payoutPerInterval,
	payoutInterval,
	payoutCurrency,
	displayCurrency,
	payoutToDisplayRate,
	customization,
}: Props) => {
	const t = useTranslations('create-program-wizard');

	return (
		<div className="flex h-full flex-col rounded-xl border p-8">
			<h3 className="font-medium">{t('step3.payouts.title')}</h3>

			<div className="mt-6">
				{customization?.enabled ? (
					<PayoutControls
						programDuration={programDuration}
						payoutPerIntervalMin={customization.payoutPerIntervalMin}
						payoutPerIntervalMax={customization.payoutPerIntervalMax}
						payoutPerInterval={payoutPerInterval}
						payoutInterval={payoutInterval}
						payoutCurrency={payoutCurrency}
						displayCurrency={displayCurrency}
						payoutToDisplayRate={payoutToDisplayRate}
						onDurationChange={customization.onDurationChange}
						onPayoutChange={customization.onPayoutChange}
						onIntervalChange={customization.onIntervalChange}
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

			{customization ? (
				<div className="flex items-center gap-3 pt-6">
					<Switch
						data-testid="customize-payouts-switch"
						checked={customization.enabled}
						onCheckedChange={customization.onToggle}
					/>
					<span className="text-sm font-medium">{t('step3.payouts.customize')}</span>
				</div>
			) : null}
		</div>
	);
};

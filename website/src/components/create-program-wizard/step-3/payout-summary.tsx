'use client';

import { PayoutInterval } from '@/generated/prisma/enums';
import { useRouteTranslator } from '@/lib/hooks/use-route-translator';
import { PayoutPerIntervalAmount, type PayoutPerIntervalAmountProps } from './payout-per-interval-amount';

type Props = {
	programDuration: number;
	payoutInterval: PayoutInterval;
} & PayoutPerIntervalAmountProps;

export const PayoutSummary = ({
	programDuration,
	payoutPerInterval,
	payoutInterval,
	payoutCurrency,
	displayCurrency,
	payoutToDisplayRate,
}: Props) => {
	const { t } = useRouteTranslator({ namespace: 'create-program-wizard' });

	const intervalLabel =
		payoutInterval === 'monthly'
			? t('common.interval.monthly')
			: payoutInterval === 'quarterly'
				? t('common.interval.quarterly')
				: t('common.interval.yearly');

	return (
		<div className="divide-y text-sm">
			<div className="flex justify-between py-3">
				<span>{t('step3.payout_summary.program_duration')}</span>
				<span className="font-medium">
					{programDuration} {t('common.months')}
				</span>
			</div>

			<div className="flex justify-between gap-4 py-3">
				<span>{t('step3.payout_summary.payout_per_interval')}</span>
				<PayoutPerIntervalAmount
					payoutPerInterval={payoutPerInterval}
					payoutCurrency={payoutCurrency}
					displayCurrency={displayCurrency}
					payoutToDisplayRate={payoutToDisplayRate}
				/>
			</div>

			<div className="flex justify-between py-3">
				<span>{t('step3.payout_summary.schedule')}</span>
				<span className="font-medium">{intervalLabel}</span>
			</div>
		</div>
	);
};

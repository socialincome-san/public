'use client';

import { PayoutInterval } from '@/generated/prisma/enums';
import { useRouteTranslator } from '@/lib/hooks/use-route-translator';

type Props = {
	programDuration: number;
	payoutPerInterval: number;
	payoutInterval: PayoutInterval;
	currency: string;
};

export const PayoutSummary = ({ programDuration, payoutPerInterval, payoutInterval, currency }: Props) => {
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

			<div className="flex justify-between py-3">
				<span>{t('step3.payout_summary.payout_per_interval')}</span>
				<span className="font-medium">
					{currency} {payoutPerInterval}
				</span>
			</div>

			<div className="flex justify-between py-3">
				<span>{t('step3.payout_summary.schedule')}</span>
				<span className="font-medium">{intervalLabel}</span>
			</div>
		</div>
	);
};

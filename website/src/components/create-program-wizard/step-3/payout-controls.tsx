'use client';

import { Slider } from '@/components/slider';
import { Tabs, TabsList, TabsTrigger } from '@/components/tabs';
import { PayoutInterval } from '@/generated/prisma/enums';
import { useRouteTranslator } from '@/lib/hooks/use-route-translator';

type Props = {
	programDuration: number;
	payoutPerIntervalMin: number;
	payoutPerIntervalMax: number;
	payoutPerInterval: number;
	payoutInterval: PayoutInterval;
	currency: string;
	onDurationChange: (value: number) => void;
	onPayoutChange: (value: number) => void;
	onIntervalChange: (value: PayoutInterval) => void;
};

export const PayoutControls = ({
	programDuration,
	payoutPerIntervalMin,
	payoutPerIntervalMax,
	payoutPerInterval,
	payoutInterval,
	currency,
	onDurationChange,
	onPayoutChange,
	onIntervalChange,
}: Props) => {
	const { t } = useRouteTranslator({ namespace: 'create-program-wizard' });

	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<div className="flex justify-between text-sm">
					<span>{t('step3.payout_controls.program_duration')}</span>
					<span className="font-medium">
						{programDuration} {t('common.months')}
					</span>
				</div>

				<Slider
					data-testid="program-duration-slider"
					min={6}
					max={60}
					step={1}
					value={[programDuration]}
					onValueChange={([v]) => onDurationChange(v)}
				/>
			</div>

			<div className="space-y-2">
				<div className="flex justify-between text-sm">
					<span>{t('step3.payout_controls.payout_per_interval')}</span>
					<span className="font-medium">
						{currency} {payoutPerInterval}
					</span>
				</div>

				<Slider
					data-testid="payout-per-interval-slider"
					min={payoutPerIntervalMin}
					max={payoutPerIntervalMax}
					step={1}
					value={[payoutPerInterval]}
					onValueChange={([v]) => onPayoutChange(v)}
				/>
			</div>

			<div className="space-y-2">
				<p className="text-sm font-medium">{t('step3.payout_controls.payout_interval')}</p>

				<Tabs value={payoutInterval} onValueChange={(v) => onIntervalChange(v as PayoutInterval)}>
					<TabsList className="grid w-fit grid-cols-3">
						<TabsTrigger value="monthly">{t('common.interval.monthly')}</TabsTrigger>
						<TabsTrigger value="quarterly">{t('common.interval.quarterly')}</TabsTrigger>
						<TabsTrigger value="yearly">{t('common.interval.yearly')}</TabsTrigger>
					</TabsList>
				</Tabs>
			</div>
		</div>
	);
};

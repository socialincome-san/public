'use client';

import { Slider } from '@/components/slider';
import { Tabs, TabsList, TabsTrigger } from '@/components/tabs';
import { PayoutInterval } from '@/generated/prisma/client';

type Props = {
	programDuration: number;
	payoutPerInterval: number;
	payoutInterval: PayoutInterval;
	currency: string;
	onDurationChange: (value: number) => void;
	onPayoutChange: (value: number) => void;
	onIntervalChange: (value: PayoutInterval) => void;
};

export function PayoutControls({
	programDuration,
	payoutPerInterval,
	payoutInterval,
	currency,
	onDurationChange,
	onPayoutChange,
	onIntervalChange,
}: Props) {
	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<div className="flex justify-between text-sm">
					<span>Program duration</span>
					<span className="font-medium">{programDuration} months</span>
				</div>

				<Slider min={6} max={60} step={1} value={[programDuration]} onValueChange={([v]) => onDurationChange(v)} />
			</div>

			<div className="space-y-2">
				<div className="flex justify-between text-sm">
					<span>Payout per interval</span>
					<span className="font-medium">
						{currency} {payoutPerInterval}
					</span>
				</div>

				<Slider min={5} max={100} step={1} value={[payoutPerInterval]} onValueChange={([v]) => onPayoutChange(v)} />
			</div>

			<div className="space-y-2">
				<p className="text-sm font-medium">Payout interval</p>

				<Tabs value={payoutInterval} onValueChange={(v) => onIntervalChange(v as PayoutInterval)}>
					<TabsList className="grid w-fit grid-cols-3">
						<TabsTrigger value="monthly">Monthly</TabsTrigger>
						<TabsTrigger value="quarterly">Quarterly</TabsTrigger>
						<TabsTrigger value="yearly">Yearly</TabsTrigger>
					</TabsList>
				</Tabs>
			</div>
		</div>
	);
}

'use client';

import { PayoutInterval } from '@/generated/prisma/enums';

type Props = {
	programDuration: number;
	payoutPerInterval: number;
	payoutInterval: PayoutInterval;
	currency: string;
};

export function PayoutSummary({ programDuration, payoutPerInterval, payoutInterval, currency }: Props) {
	return (
		<div className="divide-y text-sm">
			<div className="flex justify-between py-3">
				<span>Program duration</span>
				<span className="font-medium">{programDuration} months</span>
			</div>

			<div className="flex justify-between py-3">
				<span>Payout per interval</span>
				<span className="font-medium">
					{currency} {payoutPerInterval}
				</span>
			</div>

			<div className="flex justify-between py-3">
				<span>Schedule</span>
				<span className="font-medium capitalize">{payoutInterval}</span>
			</div>
		</div>
	);
}

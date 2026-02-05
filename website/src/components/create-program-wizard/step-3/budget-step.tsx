'use client';

import { PayoutInterval } from '@/generated/prisma/client';
import { PayoutBox } from './payout-box';
import { ProgramCostsHeader } from './program-costs-header';
import { RecipientsBox } from './recipients-box';
import { calculateMonthlyCost, calculateTotalBudget } from './utils';

type Props = {
	amountOfRecipients: number;
	maxRecipients: number;
	programDuration: number;
	payoutPerInterval: number;
	payoutInterval: PayoutInterval;
	currency: string;
	customizePayouts: boolean;

	onRecipientsChange: (value: number) => void;
	onDurationChange: (value: number) => void;
	onPayoutChange: (value: number) => void;
	onIntervalChange: (value: PayoutInterval) => void;
	onCurrencyChange: (value: string) => void;
	onToggleCustomizePayouts: () => void;
};

export function BudgetStep({
	amountOfRecipients,
	maxRecipients,
	programDuration,
	payoutPerInterval,
	payoutInterval,
	currency,
	customizePayouts,
	onRecipientsChange,
	onDurationChange,
	onPayoutChange,
	onIntervalChange,
	onCurrencyChange,
	onToggleCustomizePayouts,
}: Props) {
	const totalBudget = calculateTotalBudget(amountOfRecipients, programDuration, payoutPerInterval, payoutInterval);
	const monthlyCost = calculateMonthlyCost(amountOfRecipients, payoutPerInterval, payoutInterval);

	return (
		<div className="space-y-8">
			<ProgramCostsHeader
				totalBudget={totalBudget}
				monthlyCost={monthlyCost}
				currency={currency}
				onCurrencyChange={onCurrencyChange}
			/>

			<div className="grid gap-6 md:grid-cols-2">
				<RecipientsBox
					amountOfRecipients={amountOfRecipients}
					maxRecipients={maxRecipients}
					onChange={onRecipientsChange}
				/>

				<PayoutBox
					programDuration={programDuration}
					payoutPerInterval={payoutPerInterval}
					payoutInterval={payoutInterval}
					currency={currency}
					customizePayouts={customizePayouts}
					onDurationChange={onDurationChange}
					onPayoutChange={onPayoutChange}
					onIntervalChange={onIntervalChange}
					onToggleCustomizePayouts={onToggleCustomizePayouts}
				/>
			</div>
		</div>
	);
}

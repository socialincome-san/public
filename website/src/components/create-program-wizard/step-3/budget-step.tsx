'use client';

import { Currency, PayoutInterval } from '@/generated/prisma/enums';
import { PayoutBox } from './payout-box';
import { ProgramCostsHeader } from './program-costs-header';
import { RecipientsBox } from './recipients-box';

type Props = {
	amountOfRecipients: number;
	filteredRecipients: number;
	programDuration: number;
	payoutPerIntervalMin: number;
	payoutPerIntervalMax: number;
	payoutPerInterval: number;
	payoutInterval: PayoutInterval;
	payoutCurrency: Currency;
	displayCurrency: Currency;
	calculatedTotalBudget: number;
	displayMonthlyCost: number;
	exchangeRateText?: string;
	totalBudgetTooltipText: string;
	isCalculatingBudget: boolean;
	customizePayouts: boolean;

	onRecipientsChange: (value: number) => void;
	onDurationChange: (value: number) => void;
	onPayoutChange: (value: number) => void;
	onIntervalChange: (value: PayoutInterval) => void;
	onCurrencyChange: (value: string) => void;
	onToggleCustomizePayouts: () => void;
};

export const BudgetStep = ({
	amountOfRecipients,
	filteredRecipients,
	programDuration,
	payoutPerIntervalMin,
	payoutPerIntervalMax,
	payoutPerInterval,
	payoutInterval,
	payoutCurrency,
	displayCurrency,
	calculatedTotalBudget,
	displayMonthlyCost,
	exchangeRateText,
	totalBudgetTooltipText,
	isCalculatingBudget,
	customizePayouts,
	onRecipientsChange,
	onDurationChange,
	onPayoutChange,
	onIntervalChange,
	onCurrencyChange,
	onToggleCustomizePayouts,
}: Props) => (
		<div className="space-y-8">
			<ProgramCostsHeader
				totalBudget={calculatedTotalBudget}
				monthlyCost={displayMonthlyCost}
				currency={displayCurrency}
				exchangeRateText={exchangeRateText}
				totalBudgetTooltipText={totalBudgetTooltipText}
				isCalculatingBudget={isCalculatingBudget}
				onCurrencyChange={onCurrencyChange}
			/>

			<div className="grid gap-6 md:grid-cols-2">
				<RecipientsBox
					amountOfRecipients={amountOfRecipients}
					filteredRecipients={filteredRecipients}
					onChange={onRecipientsChange}
				/>

				<PayoutBox
					programDuration={programDuration}
					payoutPerIntervalMin={payoutPerIntervalMin}
					payoutPerIntervalMax={payoutPerIntervalMax}
					payoutPerInterval={payoutPerInterval}
					payoutInterval={payoutInterval}
					currency={payoutCurrency}
					customizePayouts={customizePayouts}
					onDurationChange={onDurationChange}
					onPayoutChange={onPayoutChange}
					onIntervalChange={onIntervalChange}
					onToggleCustomizePayouts={onToggleCustomizePayouts}
				/>
			</div>
		</div>
);

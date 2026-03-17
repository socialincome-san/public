'use client';

import { Currency, PayoutInterval } from '@/generated/prisma/enums';
import { useRouteTranslator } from '@/lib/hooks/use-route-translator';
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
	<BudgetStepContent
		amountOfRecipients={amountOfRecipients}
		filteredRecipients={filteredRecipients}
		programDuration={programDuration}
		payoutPerIntervalMin={payoutPerIntervalMin}
		payoutPerIntervalMax={payoutPerIntervalMax}
		payoutPerInterval={payoutPerInterval}
		payoutInterval={payoutInterval}
		payoutCurrency={payoutCurrency}
		displayCurrency={displayCurrency}
		calculatedTotalBudget={calculatedTotalBudget}
		displayMonthlyCost={displayMonthlyCost}
		exchangeRateText={exchangeRateText}
		totalBudgetTooltipText={totalBudgetTooltipText}
		isCalculatingBudget={isCalculatingBudget}
		customizePayouts={customizePayouts}
		onRecipientsChange={onRecipientsChange}
		onDurationChange={onDurationChange}
		onPayoutChange={onPayoutChange}
		onIntervalChange={onIntervalChange}
		onCurrencyChange={onCurrencyChange}
		onToggleCustomizePayouts={onToggleCustomizePayouts}
	/>
);

const BudgetStepContent = ({
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
	isCalculatingBudget,
	customizePayouts,
	onRecipientsChange,
	onDurationChange,
	onPayoutChange,
	onIntervalChange,
	onCurrencyChange,
	onToggleCustomizePayouts,
}: Props) => {
	const { t } = useRouteTranslator({ namespace: 'create-program-wizard' });
	const numberOfIntervals =
		payoutInterval === 'quarterly'
			? programDuration / 3
			: payoutInterval === 'yearly'
				? programDuration / 12
				: programDuration;
	const intervalLabel =
		payoutInterval === 'quarterly'
			? t('step3.total_costs.interval_label.quarterly')
			: payoutInterval === 'yearly'
				? t('step3.total_costs.interval_label.yearly')
				: t('step3.total_costs.interval_label.monthly');
	const localizedTooltipText = t('step3.total_costs.tooltip', {
		recipients: amountOfRecipients.toLocaleString('de-CH'),
		payoutPerInterval: payoutPerInterval.toLocaleString('de-CH'),
		payoutCurrency,
		numberOfIntervals: numberOfIntervals.toLocaleString('de-CH'),
		intervalLabel,
		totalBudget: calculatedTotalBudget.toLocaleString('de-CH'),
		displayCurrency,
	});

	return (
		<div className="space-y-8">
			<ProgramCostsHeader
				totalBudget={calculatedTotalBudget}
				monthlyCost={displayMonthlyCost}
				currency={displayCurrency}
				exchangeRateText={exchangeRateText}
				totalBudgetTooltipText={localizedTooltipText}
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
};

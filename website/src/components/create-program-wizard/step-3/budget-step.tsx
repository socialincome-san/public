'use client';

import { Currency, PayoutInterval } from '@/generated/prisma/enums';
import { useTranslations } from 'next-intl';
import { PayoutBox, type PayoutCustomization } from './payout-box';
import { ProgramCostsHeader } from './program-costs-header';
import { RecipientsBox } from './recipients-box';

type Props = {
	recipientsTitle: string;
	totalCostsTitle: string;
	amountOfRecipients: number;
	filteredRecipients: number;
	programDuration: number;
	payoutPerInterval: number;
	payoutInterval: PayoutInterval;
	payoutCurrency: Currency;
	displayCurrency: Currency;
	calculatedTotalBudget: number;
	displayMonthlyCost: number;
	exchangeRateText?: string;
	payoutToDisplayRate?: number;
	isCalculatingBudget: boolean;
	// Without it the payouts are fixed and only summarized
	payoutCustomization?: PayoutCustomization;
	onRecipientsChange: (value: number) => void;
	onCurrencyChange: (value: string) => void;
};

export const BudgetStep = ({
	recipientsTitle,
	totalCostsTitle,
	amountOfRecipients,
	filteredRecipients,
	programDuration,
	payoutPerInterval,
	payoutInterval,
	payoutCurrency,
	displayCurrency,
	calculatedTotalBudget,
	displayMonthlyCost,
	exchangeRateText,
	payoutToDisplayRate,
	isCalculatingBudget,
	payoutCustomization,
	onRecipientsChange,
	onCurrencyChange,
}: Props) => {
	const t = useTranslations('create-program-wizard');
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
		totalBudget: Math.round(calculatedTotalBudget).toLocaleString('de-CH'),
		displayCurrency,
	});

	return (
		<div className="space-y-8">
			<ProgramCostsHeader
				title={totalCostsTitle}
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
					title={recipientsTitle}
					amountOfRecipients={amountOfRecipients}
					filteredRecipients={filteredRecipients}
					onChange={onRecipientsChange}
				/>

				<PayoutBox
					programDuration={programDuration}
					payoutPerInterval={payoutPerInterval}
					payoutInterval={payoutInterval}
					payoutCurrency={payoutCurrency}
					displayCurrency={displayCurrency}
					payoutToDisplayRate={payoutToDisplayRate}
					customization={payoutCustomization}
				/>
			</div>
		</div>
	);
};

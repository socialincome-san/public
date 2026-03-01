'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/select';
import { allCurrencies } from '@/lib/types/currency';

type Props = {
	totalBudget: number;
	monthlyCost: number;
	currency: string;
	onCurrencyChange: (value: string) => void;
};

export const ProgramCostsHeader = ({ totalBudget, monthlyCost, currency, onCurrencyChange }: Props) => {
	return (
		<div className="flex items-start justify-between text-cyan-900">
			<div className="space-y-1">
				<p className="text-sm font-medium text-black">Total program costs</p>

				<div className="flex items-end gap-4">
					<div className="flex items-baseline gap-2">
						<span className="text-sm font-semibold">{currency}</span>
						<span data-testid={`total-budget-${totalBudget}`} className="text-6xl">
							{totalBudget.toLocaleString('de-CH')}
						</span>
					</div>

					<span className="pb-1 text-sm">
						{currency}{' '}
						<span data-testid={`monthly-cost-${Math.round(monthlyCost)}`}>
							{Math.round(monthlyCost).toLocaleString('de-CH')}
						</span>{' '}
						/ month
					</span>
				</div>
			</div>

			<Select value={currency} onValueChange={onCurrencyChange}>
				<SelectTrigger className="w-24">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{allCurrencies.map((currencyOption) => (
						<SelectItem key={currencyOption} value={currencyOption}>
							{currencyOption}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
};

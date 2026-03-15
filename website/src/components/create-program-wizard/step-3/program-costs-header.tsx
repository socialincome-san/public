'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/tool-tip';
import { websiteCurrencies } from '@/lib/i18n/utils';
import { cn } from '@/lib/utils/cn';
import { CircleHelp } from 'lucide-react';

type Props = {
	totalBudget: number;
	monthlyCost: number;
	currency: string;
	exchangeRateText?: string;
	totalBudgetTooltipText: string;
	isCalculatingBudget: boolean;
	onCurrencyChange: (value: string) => void;
};

export const ProgramCostsHeader = ({
	totalBudget,
	monthlyCost,
	currency,
	exchangeRateText,
	totalBudgetTooltipText,
	isCalculatingBudget,
	onCurrencyChange,
}: Props) => {
	return (
		<div className="flex items-start justify-between text-cyan-900">
			<div className="space-y-1">
				<div className="flex items-center gap-2">
					<p className="text-sm font-medium text-black">Total program costs</p>
					<Tooltip>
						<TooltipTrigger asChild>
							<button
								type="button"
								aria-label="Show total program cost calculation"
								className="text-muted-foreground hover:text-foreground inline-flex"
							>
								<CircleHelp className="h-4 w-4" />
							</button>
						</TooltipTrigger>
						<TooltipContent sideOffset={8} className="max-w-[320px]">
							{totalBudgetTooltipText}
						</TooltipContent>
					</Tooltip>
				</div>

				<div className="flex items-end gap-4" aria-busy={isCalculatingBudget}>
					<div className="flex items-baseline gap-2">
						<span className="text-sm font-semibold">{currency}</span>
						<span
							data-testid={`total-budget-${totalBudget}`}
							className={cn('text-6xl', isCalculatingBudget && 'opacity-60')}
						>
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

			<div className="flex flex-col items-end gap-1">
				<Select value={currency} onValueChange={onCurrencyChange}>
					<SelectTrigger className="w-24">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{websiteCurrencies.map((currencyOption) => (
							<SelectItem key={currencyOption} value={currencyOption}>
								{currencyOption}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				{isCalculatingBudget ? (
					<span className="text-xs text-cyan-800">Updating total cost...</span>
				) : (
					exchangeRateText && <span className="text-xs text-cyan-800">{exchangeRateText}</span>
				)}
			</div>
		</div>
	);
};

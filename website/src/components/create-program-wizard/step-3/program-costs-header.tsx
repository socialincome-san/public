'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/select/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/tool-tip';
import { useRouteTranslator } from '@/lib/hooks/use-route-translator';
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
	const { t } = useRouteTranslator({ namespace: 'create-program-wizard' });

	return (
		<div className="text-foreground flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
			<div className="min-w-0 space-y-1">
				<div className="flex items-center gap-2">
					<p className="text-sm font-medium">{t('step3.total_costs.title')}</p>
					<Tooltip>
						<TooltipTrigger asChild>
							<button
								type="button"
								aria-label={t('step3.total_costs.aria')}
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

				<div className="flex flex-wrap items-end gap-x-4 gap-y-1" aria-busy={isCalculatingBudget}>
					<div className="flex items-baseline gap-2">
						<span className="text-sm font-bold">{currency}</span>
						<span data-testid="total-budget" className={cn('text-6xl', isCalculatingBudget && 'opacity-60')}>
							{Math.round(totalBudget).toLocaleString('de-CH')}
						</span>
					</div>

					<span className="pb-1 text-sm">
						{currency} <span data-testid="monthly-cost">{Math.round(monthlyCost).toLocaleString('de-CH')}</span>{' '}
						{t('common.per_month')}
					</span>
				</div>
			</div>

			<div className="flex flex-col items-start gap-1 sm:items-end">
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
					<span className="text-muted-foreground text-xs">{t('step3.total_costs.updating')}</span>
				) : (
					exchangeRateText && <span className="text-muted-foreground text-xs">{exchangeRateText}</span>
				)}
			</div>
		</div>
	);
};

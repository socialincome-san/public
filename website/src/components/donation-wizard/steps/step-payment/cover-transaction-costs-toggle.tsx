'use client';

import { Switch } from '@/components/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/tool-tip';
import { useRouteTranslator } from '@/lib/hooks/use-route-translator';
import { formatCurrencyLocale } from '@/lib/utils/string-utils';
import { CircleHelp } from 'lucide-react';
import type { Cadence } from '../../utils/donation-amount';

type Props = {
	cadence: Cadence;
	currency: string;
	transactionCost: number;
	checked: boolean;
	onCheckedChange: (checked: boolean) => void;
};

export const CoverTransactionCostsToggle = ({ cadence, currency, transactionCost, checked, onCheckedChange }: Props) => {
	const { t, language } = useRouteTranslator({ namespace: 'donation-wizard' });
	const switchId = 'cover-transaction-costs';
	const locale = language === 'de' ? 'de-CH' : language;
	const fee = formatCurrencyLocale(transactionCost, currency, locale, {
		minimumFractionDigits: 0,
		maximumFractionDigits: 2,
	});

	return (
		<div className="bg-accent flex flex-col gap-3 rounded-md px-4 py-2 sm:flex-row sm:items-center sm:gap-2">
			<p className="text-foreground min-w-0 flex-1 text-sm leading-snug">{t('stepPayment.cover-costs-description')}</p>
			<div className="flex shrink-0 items-center gap-3">
				<Switch id={switchId} checked={checked} onCheckedChange={onCheckedChange} />
				<div className="flex items-center gap-1.5">
					<label htmlFor={switchId} className="cursor-pointer text-sm leading-none font-medium">
						{cadence === 'monthly'
							? t('stepPayment.cover-costs-label-monthly', { fee })
							: t('stepPayment.cover-costs-label-one-time', { fee })}
					</label>
					<Tooltip>
						<TooltipTrigger asChild>
							<button
								type="button"
								aria-label={t('stepPayment.cover-costs-tooltip-aria')}
								className="text-muted-foreground hover:text-foreground inline-flex shrink-0"
							>
								<CircleHelp className="size-4" aria-hidden />
							</button>
						</TooltipTrigger>
						<TooltipContent sideOffset={8} className="max-w-[280px] leading-snug">
							{t('stepPayment.cover-costs-tooltip')}
						</TooltipContent>
					</Tooltip>
				</div>
			</div>
		</div>
	);
};

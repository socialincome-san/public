'use client';

import { Switch } from '@/components/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/tool-tip';
import { useRouteTranslator } from '@/lib/hooks/use-route-translator';
import { CircleHelp } from 'lucide-react';
import type { Cadence } from '../wizard/donation-amount';

type Props = {
	cadence: Cadence;
	currency: string;
	transactionCost: number;
	checked: boolean;
	onCheckedChange: (checked: boolean) => void;
};

const formatFee = (currency: string, amount: number): string => {
	const formatted = Number.isInteger(amount) ? amount.toString() : amount.toFixed(2);

	return `${currency} ${formatted}`;
};

export const CoverTransactionCostsToggle = ({ cadence, currency, transactionCost, checked, onCheckedChange }: Props) => {
	const { t } = useRouteTranslator({ namespace: 'donation-wizard' });
	const switchId = 'cover-transaction-costs';
	const fee = formatFee(currency, transactionCost);

	return (
		<div className="bg-accent flex flex-col gap-3 rounded-md px-4 py-2 sm:flex-row sm:items-center sm:gap-2">
			<p className="text-foreground min-w-0 flex-1 text-sm leading-snug">{t('step3.cover-costs-description')}</p>
			<div className="flex shrink-0 items-center gap-3">
				<Switch id={switchId} checked={checked} onCheckedChange={onCheckedChange} />
				<div className="flex items-center gap-1.5">
					<label htmlFor={switchId} className="cursor-pointer text-sm leading-none font-medium">
						{cadence === 'monthly'
							? t('step3.cover-costs-label-monthly', { fee })
							: t('step3.cover-costs-label-one-time', { fee })}
					</label>
					<Tooltip>
						<TooltipTrigger asChild>
							<button
								type="button"
								aria-label={t('step3.cover-costs-tooltip-aria')}
								className="text-muted-foreground hover:text-foreground inline-flex shrink-0"
							>
								<CircleHelp className="size-4" aria-hidden />
							</button>
						</TooltipTrigger>
						<TooltipContent sideOffset={8} className="max-w-[280px] leading-snug">
							{t('step3.cover-costs-tooltip')}
						</TooltipContent>
					</Tooltip>
				</div>
			</div>
		</div>
	);
};

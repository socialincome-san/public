'use client';

import { Switch } from '@/components/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/tool-tip';
import { useRouteTranslator } from '@/lib/hooks/use-route-translator';
import { COVER_TRANSACTION_COSTS_NUDGE_BACKGROUND } from '@/lib/services/subscription/cover-transaction-costs';
import { cn } from '@/lib/utils/cn';
import { CircleHelp } from 'lucide-react';
import type { Cadence } from '../../utils/donation-amount';
import { formatDonationCurrencyAmount } from '../../utils/donation-formatting';

type Props = {
	cadence: Cadence;
	currency: string;
	transactionCost: number;
	checked: boolean;
	onCheckedChange: (checked: boolean) => void;
	disabled?: boolean;
	switchId?: string;
	layout?: 'row' | 'stacked';
	tone?: 'accent' | 'warning';
};

export const CoverTransactionCostsToggle = ({
	cadence,
	currency,
	transactionCost,
	checked,
	onCheckedChange,
	disabled = false,
	switchId = 'cover-transaction-costs',
	layout = 'row',
	tone = 'accent',
}: Props) => {
	const { t } = useRouteTranslator({ namespace: 'donation-wizard' });
	const fee = formatDonationCurrencyAmount(currency, transactionCost);

	return (
		<div
			className={cn(
				'flex max-w-full min-w-0 flex-col gap-3 overflow-hidden rounded-md px-4 py-3',
				tone === 'warning' ? null : 'bg-accent',
				layout === 'row' && 'sm:flex-row sm:items-center sm:gap-2',
			)}
			style={tone === 'warning' ? { backgroundColor: COVER_TRANSACTION_COSTS_NUDGE_BACKGROUND } : undefined}
			data-testid="cover-transaction-costs-toggle"
		>
			<p className="text-foreground min-w-0 text-sm leading-snug break-words">{t('stepPayment.cover-costs-description')}</p>
			<div className="flex min-w-0 items-center gap-3">
				<Switch
					id={switchId}
					checked={checked}
					disabled={disabled}
					onCheckedChange={onCheckedChange}
					data-testid="cover-transaction-costs-switch"
				/>
				<label htmlFor={switchId} className="text-foreground min-w-0 flex-1 cursor-pointer text-sm leading-snug font-medium">
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
	);
};

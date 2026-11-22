'use client';

import { cn } from '@socialincome/design-system/cn';
import { Switch } from '@socialincome/design-system/forms/switch/switch';
import { InfoTooltip } from '@socialincome/design-system/overlays/info-tooltip/info-tooltip';
import { useTranslations } from 'next-intl';
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
	tone = 'accent',
}: Props) => {
	const t = useTranslations('donation-wizard');
	const fee = formatDonationCurrencyAmount(currency, transactionCost);

	return (
		<div
			data-testid="cover-transaction-costs-toggle"
			className={cn(
				'flex max-w-full min-w-0 items-center gap-3 overflow-hidden rounded-md px-4 py-2',
				tone === 'warning' ? 'bg-highlight' : 'bg-accent',
			)}
		>
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
			<InfoTooltip label={t('stepPayment.cover-costs-tooltip-aria')}>{t('stepPayment.cover-costs-tooltip')}</InfoTooltip>
		</div>
	);
};

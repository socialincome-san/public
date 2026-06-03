'use client';

import { Switch } from '@/components/switch';
import { useRouteTranslator } from '@/lib/hooks/use-route-translator';
import type { Cadence } from '../wizard/donation-amount';

type Props = {
	cadence: Cadence;
	checked: boolean;
	onCheckedChange: (checked: boolean) => void;
};

export const CoverTransactionCostsToggle = ({ cadence, checked, onCheckedChange }: Props) => {
	const { t } = useRouteTranslator({ namespace: 'donation-wizard' });
	const switchId = 'cover-transaction-costs';

	return (
		<div className="bg-accent flex flex-col gap-3 rounded-md px-4 py-2 sm:flex-row sm:items-center sm:gap-2">
			<p className="text-foreground min-w-0 flex-1 text-sm leading-snug">{t('step3.cover-costs-description')}</p>
			<div className="flex shrink-0 items-center gap-3">
				<Switch id={switchId} checked={checked} onCheckedChange={onCheckedChange} />
				<label htmlFor={switchId} className="cursor-pointer text-sm leading-none font-medium">
					{cadence === 'monthly' ? t('step3.cover-costs-label-monthly') : t('step3.cover-costs-label-one-time')}
				</label>
			</div>
		</div>
	);
};

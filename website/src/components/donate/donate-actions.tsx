'use client';

import { useDonateAmount } from '@/components/donate/donate-amount-context';
import { Button } from '@socialincome/design-system/actions/button/button';
import { useTranslations } from 'next-intl';

export const DonateActions = () => {
	const t = useTranslations('website-donate.page');
	const { donation, error, formatAmount, openWizard } = useDonateAmount();

	return (
		<div className="flex w-full flex-col gap-4">
			<Button fullWidth disabled={Boolean(error)} onClick={() => openWizard('monthly')}>
				{t('donate-monthly', { amount: formatAmount(donation) })}
			</Button>
			{/* Goes straight into the one-time flow, like the link in the donation box */}
			<Button variant="link" size="inline" disabled={Boolean(error)} onClick={() => openWizard('one-time')}>
				{t('donate-once', { amount: formatAmount(donation) })}
			</Button>
		</div>
	);
};

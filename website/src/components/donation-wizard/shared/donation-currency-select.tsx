'use client';

import { isWebsiteCurrency, websiteCurrencies, type WebsiteCurrency } from '@/lib/i18n/utils';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@socialincome/design-system/forms/select/select';
import { useTranslations } from 'next-intl';

type Props = {
	value: WebsiteCurrency;
	onChange: (currency: WebsiteCurrency) => void;
};

export const DonationCurrencySelect = ({ value, onChange }: Props) => {
	const t = useTranslations('donation-wizard');

	return (
		<Select
			value={value}
			onValueChange={(next) => {
				if (isWebsiteCurrency(next)) {
					onChange(next);
				}
			}}
		>
			<SelectTrigger size="sm" aria-label={t('modal.currency')} data-testid="donation-wizard-currency">
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				{websiteCurrencies.map((currency) => (
					<SelectItem key={currency} value={currency}>
						{currency}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
};

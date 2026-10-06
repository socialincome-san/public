'use client';

import { useI18n } from '@/lib/i18n/use-i18n';
import { WebsiteCurrency, websiteCurrencies } from '@/lib/i18n/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@socialincome/design-system/select/select';

type Props = {
	currencies: WebsiteCurrency[];
};

export const DonationCurrencySelector = ({ currencies }: Props) => {
	const { currency, setCurrency } = useI18n();

	return (
		<Select
			value={currency}
			onValueChange={(value: string) => {
				if (websiteCurrencies.includes(value as WebsiteCurrency)) {
					setCurrency(value as WebsiteCurrency);
				}
			}}
		>
			<SelectTrigger>
				<SelectValue>{currency}</SelectValue>
			</SelectTrigger>
			<SelectContent>
				{currencies.map((curr) => (
					<SelectItem key={curr} value={curr}>
						{curr}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
};

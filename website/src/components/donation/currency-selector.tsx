'use client';

import { isWebsiteCurrency, type WebsiteCurrency } from '@/lib/i18n/utils';
import { setWebsiteCurrency, useWebsiteCurrency } from '@/lib/i18n/website-currency';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@socialincome/design-system/forms/select/select';

type Props = {
	currencies: WebsiteCurrency[];
};

export const DonationCurrencySelector = ({ currencies }: Props) => {
	const currency = useWebsiteCurrency();

	return (
		<Select
			value={currency}
			onValueChange={(value: string) => {
				if (isWebsiteCurrency(value)) {
					setWebsiteCurrency(value);
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

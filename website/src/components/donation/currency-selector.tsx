'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/select';
import { useI18n } from '@/lib/i18n/useI18n';
import { WebsiteCurrency, websiteCurrencies } from '@/lib/i18n/utils';
import { cn } from '@/lib/utils/cn';

type Props = {
	currencies: WebsiteCurrency[];
	className?: string;
};

export const DonationCurrencySelector = ({ currencies, className }: Props) => {
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
			<SelectTrigger className={cn('h-12 rounded-xl', className)}>
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

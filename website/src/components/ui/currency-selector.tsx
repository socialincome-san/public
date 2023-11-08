'use client';

import { useI18n } from '@/app/providers/i18n-provider-client';
import { getFlagComponentByCurrency } from '@/components/country-flags';
import { WebsiteCurrency } from '@/i18n';
import {
	FontSize,
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Typography,
} from '@socialincome/ui';
import React from 'react';

type CurrencySelectorProps = {
	currencies: WebsiteCurrency[];
	fontSize?: FontSize;
} & React.HTMLAttributes<HTMLDivElement>;

const CurrencySelector = React.forwardRef<HTMLDivElement, CurrencySelectorProps>(
	({ currencies, fontSize = 'md', ...props }: CurrencySelectorProps, ref) => {
		const { currency, setCurrency } = useI18n();
		const Flag = getFlagComponentByCurrency(currency);

		return (
			<div ref={ref} {...props}>
				<Select value={currency} onValueChange={(currency: WebsiteCurrency) => setCurrency(currency)}>
					<SelectTrigger className="h-full">
						<Flag className="h-5 w-5" />
						<SelectValue>
							<Typography size={fontSize}>{currency}</Typography>
						</SelectValue>
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							{currencies.map((curr, index) => (
								<SelectItem key={index} value={curr}>
									<Typography size={fontSize}>{curr}</Typography>
								</SelectItem>
							))}
						</SelectGroup>
					</SelectContent>
				</Select>
			</div>
		);
	},
);

CurrencySelector.displayName = 'CurrencySelector';
export { CurrencySelector };

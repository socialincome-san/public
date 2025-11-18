'use client';

import { getFlagComponentByCurrency } from '@/components/legacy/country-flags';
import { useI18n } from '@/lib/i18n/useI18n';
import { WebsiteCurrency } from '@/lib/i18n/utils';
import { isValidCurrency } from '@socialincome/shared/src/types/currency';
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
import classNames from 'classnames';
import React from 'react';

type CurrencySelectorProps = {
	currencies: WebsiteCurrency[];
	fontSize?: FontSize;
} & React.HTMLAttributes<HTMLDivElement>;

const CurrencySelector = React.forwardRef<HTMLDivElement, CurrencySelectorProps>(
	({ currencies, fontSize = 'md', className, ...props }: CurrencySelectorProps, ref) => {
		let { currency, setCurrency } = useI18n();
		const Flag = getFlagComponentByCurrency(currency);

		return (
			<div ref={ref} className={classNames('w-full md:max-w-[12rem]', className)} {...props}>
				<Select
					value={currency}
					onValueChange={(currency: WebsiteCurrency) => {
						isValidCurrency(currency) && setCurrency(currency);
					}}
				>
					<SelectTrigger className="h-full px-5">
						{Flag && <Flag className="mx-2 h-5 w-5 rounded" />}
						<SelectValue>
							<Typography size={fontSize} color="popover-foreground">
								{currency}
							</Typography>
						</SelectValue>
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							{currencies.map((curr, index) => (
								<SelectItem key={index} value={curr}>
									<Typography size={fontSize} color="popover-foreground">
										{curr}
									</Typography>
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

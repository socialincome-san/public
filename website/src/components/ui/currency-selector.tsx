'use client';

import { useI18n } from '@/components/providers/context-providers';
import { WebsiteCurrency } from '@/i18n';
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
import { getCurrencyFlagImageURL } from '@socialincome/ui/src/lib/utils';
import classNames from 'classnames';
import Image from 'next/image';
import React from 'react';

type CurrencySelectorProps = {
	currencies: WebsiteCurrency[];
	fontSize?: FontSize;
} & React.HTMLAttributes<HTMLDivElement>;

const CurrencySelector = React.forwardRef<HTMLDivElement, CurrencySelectorProps>(
	({ currencies, fontSize = 'md', className, ...props }: CurrencySelectorProps, ref) => {
		let { currency, setCurrency } = useI18n();

		return (
			<div ref={ref} className={classNames('w-full md:max-w-[12rem]', className)} {...props}>
				<Select
					value={currency}
					onValueChange={(currency: WebsiteCurrency) => {
						isValidCurrency(currency) && setCurrency(currency);
					}}
				>
					<SelectTrigger className="h-full px-5">
						{currency && (
							<Image
								src={getCurrencyFlagImageURL(currency)}
								width={20}
								height={20}
								alt=""
								priority
								unoptimized
								className="mx-2 rounded"
							/>
						)}
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

'use client';

import { useI18n } from '@/lib/i18n/useI18n';
import { WebsiteCurrency } from '@/lib/i18n/utils';
import { isValidCurrency } from '@/lib/types/currency';
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
import { CH, EU } from 'country-flag-icons/react/1x1';
import { SL, US } from 'country-flag-icons/react/3x2';
import React from 'react';

const FLAG_COMPONENTS: Record<WebsiteCurrency, React.ComponentType<unknown>> = {
  USD: US,
  CHF: CH,
  EUR: EU,
  SLE: SL,
};

type CurrencySelectorProps = {
  currencies: WebsiteCurrency[];
  fontSize?: FontSize;
} & React.HTMLAttributes<HTMLDivElement>;

const CurrencySelector = React.forwardRef<HTMLDivElement, CurrencySelectorProps>(
  ({ currencies, fontSize = 'md', className, ...props }, ref) => {
    const { currency, setCurrency } = useI18n();

    const Flag = FLAG_COMPONENTS[currency ?? 'CHF'];

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
              {currencies.map((curr) => (
                <SelectItem key={curr} value={curr}>
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

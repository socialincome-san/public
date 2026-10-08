'use client';

import type { WebsiteCurrency } from '@/lib/i18n/utils';
import { useWebsiteCurrency } from '@/lib/i18n/website-currency';
import type { ReactNode } from 'react';

type Props = {
	variants: Record<WebsiteCurrency, ReactNode>;
};

export const CurrencySwitch = ({ variants }: Props) => variants[useWebsiteCurrency()];

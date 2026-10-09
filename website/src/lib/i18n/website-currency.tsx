'use client';

import { defaultCurrency, getWebsiteBasePath, type WebsiteCurrency } from '@/lib/i18n/utils';
import { useLocale } from 'next-intl';
import { createContext, use, type ReactNode } from 'react';

// Provided by the website layout: reading the currency with `useParams()` would count as URL data and keep
// dynamic routes' navbars out of the static shell.
const WebsiteCurrencyContext = createContext<WebsiteCurrency>(defaultCurrency);

export const WebsiteCurrencyProvider = ({ currency, children }: { currency: WebsiteCurrency; children: ReactNode }) => (
	<WebsiteCurrencyContext value={currency}>{children}</WebsiteCurrencyContext>
);

export const useWebsiteCurrency = (): WebsiteCurrency => use(WebsiteCurrencyContext);

export const useWebsiteBasePath = () => getWebsiteBasePath(useLocale(), useWebsiteCurrency());

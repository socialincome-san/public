'use client';

import { CURRENCY_COOKIE } from '@/lib/i18n/cookies';
import { getDefaultCurrency, isWebsiteCurrency, type WebsiteCurrency } from '@/lib/i18n/utils';
import Cookies from 'js-cookie';
import { createContext, use, useSyncExternalStore, type ReactNode } from 'react';

// Provided by the website layout: reading the region with `useParams()` would count as URL data and keep
// dynamic routes' navbars out of the static shell.
const WebsiteRegionContext = createContext<string | undefined>(undefined);

export const WebsiteRegionProvider = ({ region, children }: { region: string; children: ReactNode }) => (
	<WebsiteRegionContext value={region}>{children}</WebsiteRegionContext>
);

const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
	listeners.add(listener);

	return () => {
		listeners.delete(listener);
	};
};

export const setWebsiteCurrency = (currency: WebsiteCurrency) => {
	Cookies.set(CURRENCY_COOKIE, currency, { expires: 7 });
	listeners.forEach((listener) => listener());
};

// The server and hydration render the region default, so static pages stay cacheable; the visitor's
// preference (set by the switcher or guessed by the proxy) applies right after hydration.
export const useWebsiteCurrency = (): WebsiteCurrency => {
	const defaultCurrency = getDefaultCurrency(use(WebsiteRegionContext));

	return useSyncExternalStore(
		subscribe,
		() => {
			const preference = Cookies.get(CURRENCY_COOKIE);

			return isWebsiteCurrency(preference) ? preference : defaultCurrency;
		},
		() => defaultCurrency,
	);
};

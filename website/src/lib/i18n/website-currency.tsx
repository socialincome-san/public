'use client';

import { defaultCurrency, getWebsiteBasePath, type WebsiteCurrency } from '@/lib/i18n/utils';
import { useLocale } from 'next-intl';
import { createContext, use, useEffect, useState, type ReactNode } from 'react';

// Provided by the website layout: reading the currency with `useParams()` would count as URL data and keep
// dynamic routes' navbars out of the static shell.
const WebsiteCurrencyContext = createContext<WebsiteCurrency>(defaultCurrency);
const VisitorCountryContext = createContext<string | null>(null);

export const WebsiteCurrencyProvider = ({ currency, children }: { currency: WebsiteCurrency; children: ReactNode }) => {
	const [visitorCountryCode, setVisitorCountryCode] = useState<string | null>(null);

	useEffect(() => {
		const controller = new AbortController();

		void fetch('/api/visitor-country', { signal: controller.signal })
			.then(async (response) => {
				if (!response.ok) {
					throw new Error(`Visitor country request failed with status ${response.status}.`);
				}

				const payload: unknown = await response.json();

				return payload;
			})
			.then((payload) => {
				if (typeof payload !== 'object' || payload === null || !('country' in payload)) {
					throw new Error('Visitor country response did not include a country field.');
				}
				const country = payload.country;
				if (country !== null && typeof country !== 'string') {
					throw new Error('Visitor country response contained an invalid country value.');
				}

				setVisitorCountryCode(country);
			})
			.catch((error: unknown) => {
				if (!controller.signal.aborted) {
					console.error('Could not load the visitor country for donation examples.', error);
				}
			});

		return () => controller.abort();
	}, []);

	return (
		<WebsiteCurrencyContext value={currency}>
			<VisitorCountryContext value={visitorCountryCode}>{children}</VisitorCountryContext>
		</WebsiteCurrencyContext>
	);
};

export const useWebsiteCurrency = (): WebsiteCurrency => use(WebsiteCurrencyContext);
export const useVisitorCountryCode = (): string | null => use(VisitorCountryContext);

export const useWebsiteBasePath = () => getWebsiteBasePath(useLocale(), useWebsiteCurrency());

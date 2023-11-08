'use client';

import { CURRENCY_COOKIE, LANGUAGE_COOKIE, REGION_COOKIE } from '@/app/[lang]/[region]';
import { useCookieState } from '@/hooks/useCookieState';
import { WebsiteCurrency, WebsiteLanguage, WebsiteRegion } from '@/i18n';
import { useRouter, useSearchParams } from 'next/navigation';
import { PropsWithChildren, createContext, useContext, useEffect } from 'react';

type I18nContextType = {
	language: WebsiteLanguage | undefined;
	setLanguage: (language: WebsiteLanguage) => void;
	region: WebsiteRegion | undefined;
	setRegion: (country: WebsiteRegion) => void;
	currency: WebsiteCurrency | undefined;
	setCurrency: (currency: WebsiteCurrency) => void;
};

const I18nContext = createContext<I18nContextType>(undefined!);
export const useI18n = () => useContext(I18nContext);

type I18nProviderClientProps = {
	cookies: Map<string, string>;
};

export function I18nProviderClient({ cookies, children }: PropsWithChildren<I18nProviderClientProps>) {
	const { value: language, setCookie: setLanguage } = useCookieState<WebsiteLanguage>(LANGUAGE_COOKIE);
	const { value: region, setCookie: setRegion } = useCookieState<WebsiteRegion>(REGION_COOKIE);
	const { value: currency, setCookie: setCurrency } = useCookieState<WebsiteCurrency>(
		CURRENCY_COOKIE,
		cookies.get(CURRENCY_COOKIE) as WebsiteCurrency,
	);

	const router = useRouter();
	const searchParams = useSearchParams();

	useEffect(() => {
		const pathSegments = window.location.pathname.split('/');
		if (language && pathSegments[1] !== language) {
			pathSegments[1] = language;
			const current = new URLSearchParams(Array.from(searchParams.entries()));
			router.push(pathSegments.join('/') + '?' + current.toString());
		}
	}, [language, router, searchParams]);

	useEffect(() => {
		const pathSegments = window.location.pathname.split('/');
		if (region && pathSegments[2] !== region) {
			pathSegments[2] = region;
			const current = new URLSearchParams(Array.from(searchParams.entries()));
			router.push(pathSegments.join('/') + '?' + current.toString());
		}
	}, [region, router, searchParams]);

	return (
		<I18nContext.Provider
			value={{
				language: language,
				setLanguage: (language) => setLanguage(language, { expires: 365 }),
				region: region,
				setRegion: (country) => setRegion(country, { expires: 365 }),
				currency: currency,
				setCurrency: (currency) => setCurrency(currency, { expires: 365 }),
			}}
		>
			{children}
		</I18nContext.Provider>
	);
}

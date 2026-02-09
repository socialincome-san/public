'use client';

import { COUNTRY_COOKIE, CURRENCY_COOKIE, LANGUAGE_COOKIE, REGION_COOKIE } from '@/app/[lang]/[region]';

import { CountryCode } from '@/generated/prisma/enums';
import { useCookieState } from '@/lib/hooks/useCookieState';
import { useI18n } from '@/lib/i18n/useI18n';
import { WebsiteCurrency, WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import _ from 'lodash';
import { useRouter, useSearchParams } from 'next/navigation';
import { createContext, PropsWithChildren, Suspense, useEffect } from 'react';

type I18nContextProps = {
	country: CountryCode | undefined;
	setCountry: (country: CountryCode) => void;
	language: WebsiteLanguage | undefined;
	setLanguage: (language: WebsiteLanguage) => void;
	region: WebsiteRegion | undefined;
	setRegion: (country: WebsiteRegion) => void;
	currency: WebsiteCurrency | undefined;
	setCurrency: (currency: WebsiteCurrency) => void;
};

export const I18nContext = createContext<I18nContextProps>(undefined!);

function I18nUrlUpdater() {
	// This component is used to watch the URL and update the language and region in the context if the URL changes.
	// It's a separate component because it uses the useSearchParams hook, and needs to be wrapped in a Suspense
	// boundary (https://nextjs.org/docs/messages/deopted-into-client-rendering).
	const router = useRouter();
	const searchParams = useSearchParams();
	const searchParamsString = searchParams.toString();
	const { language, setLanguage, region, setRegion } = useI18n();

	useEffect(() => {
		const urlSegments = window.location.pathname.split('/');
		const languageInUrl = urlSegments[1] as WebsiteLanguage;
		if (_.isUndefined(language)) {
			setLanguage(languageInUrl);
		} else if (languageInUrl !== language) {
			urlSegments[1] = language;
			router.push(urlSegments.join('/') + (searchParamsString ? `?${searchParamsString}` : ''));
		}
	}, [language, router, searchParamsString, setLanguage]);

	useEffect(() => {
		const urlSegments = window.location.pathname.split('/');
		const regionInUrl = urlSegments[2] as WebsiteRegion;
		if (_.isUndefined(region)) {
			setRegion(regionInUrl);
		} else if (regionInUrl !== region) {
			urlSegments[2] = region;
			router.push(urlSegments.join('/') + (searchParamsString ? `?${searchParamsString}` : ''));
		}
	}, [region, router, searchParamsString, setRegion]);

	return null;
}

export function I18nContextProvider({ children }: PropsWithChildren) {
	const { value: language, setCookie: setLanguage } = useCookieState<WebsiteLanguage>(LANGUAGE_COOKIE);
	const { value: region, setCookie: setRegion } = useCookieState<WebsiteRegion>(REGION_COOKIE);
	const { value: currency, setCookie: setCurrency } = useCookieState<WebsiteCurrency>(CURRENCY_COOKIE);
	const { value: country, setCookie: setCountry } = useCookieState<CountryCode>(COUNTRY_COOKIE);

	return (
		<I18nContext.Provider
			value={{
				country: country,
				setCountry: (country) => setCountry(country, { expires: 7 }),
				language: language,
				setLanguage: (language) => setLanguage(language, { expires: 7 }),
				region: region,
				setRegion: (region) => setRegion(region, { expires: 7 }),
				currency: currency,
				setCurrency: (currency) => setCurrency(currency, { expires: 7 }),
			}}
		>
			<Suspense fallback={null}>
				<I18nUrlUpdater />
			</Suspense>
			{children}
		</I18nContext.Provider>
	);
}

'use client';

import { type CountryCode } from '@/generated/prisma/enums';
import { useIsPage } from '@/lib/hooks/use-is-page';
import { LANGUAGE_COOKIE, REGION_COOKIE } from '@/lib/i18n/cookies';
import {
	isWebsiteCurrency,
	isWebsiteLanguage,
	isWebsiteRegion,
	mainWebsiteLanguages,
	websiteCurrencies,
	type WebsiteLanguage,
	type WebsiteRegion,
} from '@/lib/i18n/utils';
import { setWebsiteCurrency, useWebsiteCurrency } from '@/lib/i18n/website-currency';
import {
	LocaleCurrencySwitcher as DesignSystemLocaleCurrencySwitcher,
	type LocaleRegionOption,
} from '@socialincome/design-system/navigation/locale-currency-switcher/locale-currency-switcher';
import Cookies from 'js-cookie';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const SWISS_COUNTRY_CODE: CountryCode = 'CH';
const surveyLanguages: WebsiteLanguage[] = ['en', 'kri'];

const createLocalePath = (language: WebsiteLanguage, region: WebsiteRegion) => {
	const segments = window.location.pathname.split('/');

	if (segments.length < 3) {
		return `/${language}/${region}`;
	}

	segments[1] = language;
	segments[2] = region;

	return `${segments.join('/')}${window.location.search}`;
};

type Props = {
	lang: WebsiteLanguage;
	region: string;
	variant?: 'ghost' | 'outline';
};

export const LocaleCurrencySwitcher = ({ lang, region, variant = 'ghost' }: Props) => {
	const [open, setOpen] = useState(false);
	const router = useRouter();
	const isSurveyPage = useIsPage('survey');
	const t = useTranslations('website-common');
	const currency = useWebsiteCurrency();

	const currentRegion = isWebsiteRegion(region) ? region : 'int';
	const languageOptions = isSurveyPage ? surveyLanguages : mainWebsiteLanguages;
	const currentSwitcherLanguage = languageOptions.includes(lang) ? lang : (languageOptions[0] ?? 'en');
	const regionOptions: (LocaleRegionOption & { value: WebsiteRegion })[] = [
		{ value: 'int', label: t('locale-currency-switcher.regions.int') },
		{
			value: 'ch',
			label: t('locale-currency-switcher.regions.ch'),
			flagCountry: SWISS_COUNTRY_CODE,
		},
	];

	const navigateToLocale = (nextLanguage: WebsiteLanguage, nextRegion: WebsiteRegion) => {
		setOpen(false);
		// Only read by the proxy to redirect URLs without a language and region.
		Cookies.set(LANGUAGE_COOKIE, nextLanguage, { expires: 7 });
		Cookies.set(REGION_COOKIE, nextRegion, { expires: 7 });
		router.push(createLocalePath(nextLanguage, nextRegion));
	};

	const handleLanguageChange = (value: string) => {
		if (!isWebsiteLanguage(value) || !languageOptions.includes(value)) {
			return;
		}

		navigateToLocale(value, currentRegion);
	};

	const handleRegionChange = (value: string) => {
		if (!isWebsiteRegion(value)) {
			return;
		}

		navigateToLocale(lang, value);
	};

	const handleCurrencyChange = (value: string) => {
		if (isWebsiteCurrency(value)) {
			setWebsiteCurrency(value);
			setOpen(false);
		}
	};

	return (
		<DesignSystemLocaleCurrencySwitcher
			ariaLabel={t('locale-currency-switcher.aria-label')}
			variant={variant}
			open={open}
			onOpenChange={setOpen}
			language={{
				label: t('locale-currency-switcher.language'),
				value: currentSwitcherLanguage,
				options: languageOptions.map((option) => ({ value: option, label: option.toUpperCase() })),
				onChange: handleLanguageChange,
			}}
			region={{
				label: t('locale-currency-switcher.region'),
				value: currentRegion,
				options: regionOptions,
				onChange: handleRegionChange,
			}}
			currency={{
				label: t('locale-currency-switcher.currency'),
				value: currency,
				options: websiteCurrencies.map((option) => ({ value: option, label: option })),
				onChange: handleCurrencyChange,
			}}
		/>
	);
};

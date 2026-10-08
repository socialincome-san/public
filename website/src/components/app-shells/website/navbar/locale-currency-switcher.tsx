'use client';

import { type CountryCode } from '@/generated/prisma/enums';
import { useIsPage } from '@/lib/hooks/use-is-page';
import { useI18n } from '@/lib/i18n/use-i18n';
import {
	allWebsiteLanguages,
	isWebsiteCurrency,
	mainWebsiteLanguages,
	websiteCurrencies,
	websiteRegions,
	type WebsiteCurrency,
	type WebsiteLanguage,
	type WebsiteRegion,
} from '@/lib/i18n/utils';
import {
	LocaleCurrencySwitcher as DesignSystemLocaleCurrencySwitcher,
	type LocaleRegionOption,
} from '@socialincome/design-system/navigation/locale-currency-switcher/locale-currency-switcher';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

const SWISS_COUNTRY_CODE: CountryCode = 'CH';
const surveyLanguages: WebsiteLanguage[] = ['en', 'kri'];

const isWebsiteLanguage = (value: string): value is WebsiteLanguage =>
	allWebsiteLanguages.some((language) => language === value);

const isWebsiteRegion = (value: string): value is WebsiteRegion => websiteRegions.some((region) => region === value);

const getDefaultCurrency = (region: WebsiteRegion): WebsiteCurrency => (region === 'ch' ? 'CHF' : 'USD');

const createLocalePath = ({
	pathname,
	searchParams,
	language,
	region,
}: {
	pathname: string;
	searchParams: URLSearchParams;
	language: WebsiteLanguage;
	region: WebsiteRegion;
}) => {
	const segments = pathname.split('/');

	if (segments.length < 3) {
		return `/${language}/${region}`;
	}

	segments[1] = language;
	segments[2] = region;

	const queryString = searchParams.toString();

	return `${segments.join('/')}${queryString ? `?${queryString}` : ''}`;
};

type Props = {
	lang: WebsiteLanguage;
	region: string;
	variant?: 'ghost' | 'outline';
};

export const LocaleCurrencySwitcher = ({ lang, region, variant = 'ghost' }: Props) => {
	const [open, setOpen] = useState(false);
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const isSurveyPage = useIsPage('survey');
	const t = useTranslations('website-common');
	const { language, setLanguage, region: selectedRegion, setRegion, currency, setCurrency } = useI18n();

	const initialRegion = isWebsiteRegion(region) ? region : 'int';
	const currentLanguage = language ?? lang;
	const currentRegion = selectedRegion ?? initialRegion;
	const currentCurrency = currency ?? getDefaultCurrency(currentRegion);
	const languageOptions = isSurveyPage ? surveyLanguages : mainWebsiteLanguages;
	const currentSwitcherLanguage = languageOptions.includes(currentLanguage) ? currentLanguage : (languageOptions[0] ?? 'en');
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
		router.push(createLocalePath({ pathname, searchParams, language: nextLanguage, region: nextRegion }));
	};

	const handleLanguageChange = (value: string) => {
		if (!isWebsiteLanguage(value) || !languageOptions.includes(value)) {
			return;
		}

		setLanguage(value);
		navigateToLocale(value, currentRegion);
	};

	const handleRegionChange = (value: string) => {
		if (!isWebsiteRegion(value)) {
			return;
		}

		setRegion(value);
		navigateToLocale(currentLanguage, value);
	};

	const handleCurrencyChange = (value: string) => {
		if (isWebsiteCurrency(value)) {
			setCurrency(value);
			setOpen(false);
			router.refresh();
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
				value: currentCurrency,
				options: websiteCurrencies.map((option) => ({ value: option, label: option })),
				onChange: handleCurrencyChange,
			}}
		/>
	);
};

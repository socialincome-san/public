'use client';

import { CountryFlag } from '@/components/country-flag';
import { type CountryCode } from '@/generated/prisma/enums';
import { useIsPage } from '@/lib/hooks/use-is-page';
import { useI18n } from '@/lib/i18n/use-i18n';
import { useTranslator } from '@/lib/i18n/use-translator';
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
import { Button } from '@socialincome/design-system/actions/button/button';
import { Tabs, TabsList, TabsTrigger } from '@socialincome/design-system/navigation/tabs/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@socialincome/design-system/overlays/popover/popover';
import { ChevronDown, Globe } from 'lucide-react';
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
	const translator = useTranslator(lang, 'website-common');
	const { language, setLanguage, region: selectedRegion, setRegion, currency, setCurrency } = useI18n();

	const initialRegion = isWebsiteRegion(region) ? region : 'int';
	const currentLanguage = language ?? lang;
	const currentRegion = selectedRegion ?? initialRegion;
	const currentCurrency = currency ?? getDefaultCurrency(currentRegion);
	const languageOptions = isSurveyPage ? surveyLanguages : mainWebsiteLanguages;
	const currentSwitcherLanguage = languageOptions.includes(currentLanguage) ? currentLanguage : (languageOptions[0] ?? 'en');
	const regionOptions: { value: WebsiteRegion; label: string }[] = [
		{ value: 'int', label: translator?.t('locale-currency-switcher.regions.int') ?? 'International' },
		{ value: 'ch', label: translator?.t('locale-currency-switcher.regions.ch') ?? 'Switzerland' },
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
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					type="button"
					variant={variant}
					size="md"
					aria-label={translator?.t('locale-currency-switcher.aria-label') ?? 'Change language, region, and currency'}
				>
					{currentRegion === 'ch' ? <CountryFlag country={SWISS_COUNTRY_CODE} size="sm" /> : <Globe className="size-4" />}
					<span>{currentCurrency}</span>
					<ChevronDown className="text-muted-foreground size-3.5" />
				</Button>
			</PopoverTrigger>
			<PopoverContent align="end">
				<div className="space-y-4">
					<div className="space-y-2">
						<div className="text-sm font-bold">{translator?.t('locale-currency-switcher.language') ?? 'Language'}</div>
						<Tabs value={currentSwitcherLanguage} onValueChange={handleLanguageChange}>
							<TabsList fullWidth>
								{languageOptions.map((language) => (
									<TabsTrigger key={language} value={language}>
										{language.toUpperCase()}
									</TabsTrigger>
								))}
							</TabsList>
						</Tabs>
					</div>

					<div className="space-y-2">
						<div className="text-sm font-bold">{translator?.t('locale-currency-switcher.region') ?? 'Region'}</div>
						<Tabs value={currentRegion} onValueChange={handleRegionChange}>
							<TabsList fullWidth>
								{regionOptions.map((option) => (
									<TabsTrigger key={option.value} value={option.value}>
										{option.value === 'ch' ? (
											<CountryFlag country={SWISS_COUNTRY_CODE} size="sm" />
										) : (
											<Globe className="size-4" />
										)}
										<span>{option.label}</span>
									</TabsTrigger>
								))}
							</TabsList>
						</Tabs>
					</div>

					<div className="space-y-2">
						<div className="text-sm font-bold">{translator?.t('locale-currency-switcher.currency') ?? 'Currency'}</div>
						<Tabs value={currentCurrency} onValueChange={handleCurrencyChange}>
							<TabsList fullWidth>
								{websiteCurrencies.map((currency) => (
									<TabsTrigger key={currency} value={currency}>
										{currency}
									</TabsTrigger>
								))}
							</TabsList>
						</Tabs>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
};

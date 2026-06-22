'use client';

import { Button } from '@/components/button';
import { CountryFlag } from '@/components/country-flag';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/popover';
import { Tabs, TabsList, TabsTrigger } from '@/components/tabs';
import { type CountryCode } from '@/generated/prisma/enums';
import { useIsPage } from '@/lib/hooks/useIsPage';
import { useTranslator } from '@/lib/hooks/useTranslator';
import { useI18n } from '@/lib/i18n/useI18n';
import {
	allWebsiteLanguages,
	mainWebsiteLanguages,
	websiteCurrencies,
	websiteRegions,
	type WebsiteCurrency,
	type WebsiteLanguage,
	type WebsiteRegion,
} from '@/lib/i18n/utils';
import { cn } from '@/lib/utils/cn';
import { ChevronDown, Globe } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

const SWISS_COUNTRY_CODE: CountryCode = 'CH';
const surveyLanguages: WebsiteLanguage[] = ['en', 'kri'];

const isWebsiteLanguage = (value: string): value is WebsiteLanguage =>
	allWebsiteLanguages.some((language) => language === value);

const isWebsiteRegion = (value: string): value is WebsiteRegion => websiteRegions.some((region) => region === value);

const isWebsiteCurrency = (value: string): value is WebsiteCurrency =>
	websiteCurrencies.some((currency) => currency === value);

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
	className?: string;
};

export const LocaleCurrencySwitcher = ({ lang, region, className }: Props) => {
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
					variant="ghost"
					className={cn('h-10 gap-2 rounded-full px-3 text-sm font-semibold lg:h-11', className)}
					aria-label={translator?.t('locale-currency-switcher.aria-label') ?? 'Change language, region, and currency'}
				>
					{currentRegion === 'ch' ? <CountryFlag country={SWISS_COUNTRY_CODE} size="sm" /> : <Globe className="size-4" />}
					<span>{currentCurrency}</span>
					<ChevronDown className="text-muted-foreground size-3.5" />
				</Button>
			</PopoverTrigger>
			<PopoverContent
				align="end"
				className="z-[110] w-72 space-y-4 rounded-3xl bg-white p-4 shadow-[0_24px_48px_rgba(15,23,42,0.16)]"
			>
				<div className="space-y-2">
					<div className="text-sm font-semibold">{translator?.t('locale-currency-switcher.language') ?? 'Language'}</div>
					<Tabs value={currentSwitcherLanguage} onValueChange={handleLanguageChange}>
						<TabsList className={cn('grid h-10 w-full rounded-full', isSurveyPage ? 'grid-cols-2' : 'grid-cols-4')}>
							{languageOptions.map((language) => (
								<TabsTrigger key={language} value={language} className="rounded-full">
									{language.toUpperCase()}
								</TabsTrigger>
							))}
						</TabsList>
					</Tabs>
				</div>

				<div className="space-y-2">
					<div className="text-sm font-semibold">{translator?.t('locale-currency-switcher.region') ?? 'Region'}</div>
					<Tabs value={currentRegion} onValueChange={handleRegionChange}>
						<TabsList className="grid h-10 w-full grid-cols-2 rounded-full">
							{regionOptions.map((option) => (
								<TabsTrigger key={option.value} value={option.value} className="rounded-full">
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
					<div className="text-sm font-semibold">{translator?.t('locale-currency-switcher.currency') ?? 'Currency'}</div>
					<Tabs value={currentCurrency} onValueChange={handleCurrencyChange}>
						<TabsList className="grid h-10 w-full grid-cols-3 rounded-full">
							{websiteCurrencies.map((currency) => (
								<TabsTrigger key={currency} value={currency} className="rounded-full">
									{currency}
								</TabsTrigger>
							))}
						</TabsList>
					</Tabs>
				</div>
			</PopoverContent>
		</Popover>
	);
};

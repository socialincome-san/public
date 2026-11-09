'use client';

import { type CountryCode } from '@/generated/prisma/enums';
import { useIsPage } from '@/lib/hooks/use-is-page';
import {
	getCurrencyForCountry,
	isWebsiteCurrency,
	isWebsiteLanguage,
	mainWebsiteLanguages,
	toCurrencySegment,
	websiteCurrencies,
	type WebsiteCurrency,
	type WebsiteLanguage,
} from '@/lib/i18n/utils';
import { handleResult } from '@/lib/result-client';
import { COUNTRY_CODES } from '@/lib/types/country';
import { setChosenCountryAction } from '@/modules/visitor-country/visitor-country.actions';
import { LocaleCurrencySwitcher as DesignSystemLocaleCurrencySwitcher } from '@socialincome/design-system/navigation/locale-currency-switcher/locale-currency-switcher';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { type ReactNode, startTransition, Suspense, useState } from 'react';

const surveyLanguages: WebsiteLanguage[] = ['en', 'kri'];
const AUTOMATIC_COUNTRY = 'automatic';

// Read from `window.location` on click: `usePathname()` would keep the navbar out of the static shell.
const createLocalePath = (language: WebsiteLanguage, currency: WebsiteCurrency) => {
	const { pathname, search, hash } = window.location;
	const [, , , ...pathTail] = pathname.split('/');

	return `/${[language, toCurrencySegment(currency), ...pathTail].join('/')}${search}${hash}`;
};

type Props = {
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
	variant?: 'ghost' | 'outline';
	icon?: ReactNode;
	chosenCountry: CountryCode | null;
	// The chosen or detected country, whose own currency the button leaves out
	visitorCountry: CountryCode | null;
};

const Switcher = ({
	lang,
	currency,
	variant = 'ghost',
	icon,
	chosenCountry,
	visitorCountry,
	isSurveyPage,
}: Props & { isSurveyPage: boolean }) => {
	const [open, setOpen] = useState(false);
	const router = useRouter();
	const t = useTranslations('website-common');
	const tCountries = useTranslations('countries');

	const languageOptions = isSurveyPage ? surveyLanguages : mainWebsiteLanguages;
	const currentSwitcherLanguage = languageOptions.includes(lang) ? lang : (languageOptions[0] ?? 'en');
	// "EN" in Switzerland on CHF, but "EN · EUR" there on EUR: only a currency that differs from the country's is shown.
	const isCountryCurrency = visitorCountry !== null && getCurrencyForCountry(visitorCountry) === currency;
	const triggerLabel = isCountryCurrency
		? currentSwitcherLanguage.toUpperCase()
		: `${currentSwitcherLanguage.toUpperCase()} · ${currency}`;

	const navigateToLocale = (nextLanguage: WebsiteLanguage, nextCurrency: WebsiteCurrency) => {
		setOpen(false);
		router.push(createLocalePath(nextLanguage, nextCurrency));
	};

	const handleLanguageChange = (value: string) => {
		if (isWebsiteLanguage(value) && languageOptions.includes(value)) {
			navigateToLocale(value, currency);
		}
	};

	const handleCurrencyChange = (value: string) => {
		if (isWebsiteCurrency(value)) {
			navigateToLocale(lang, value);
		}
	};

	const handleCountryChange = (value: string) => {
		setOpen(false);
		startTransition(async () => {
			handleResult(await setChosenCountryAction(value === AUTOMATIC_COUNTRY ? null : value), {
				onError: (error) => console.error('Could not change the country', { error }),
			});
		});
	};

	return (
		<DesignSystemLocaleCurrencySwitcher
			ariaLabel={t('locale-currency-switcher.aria-label')}
			variant={variant}
			icon={icon}
			triggerLabel={triggerLabel}
			open={open}
			onOpenChange={setOpen}
			language={{
				label: t('locale-currency-switcher.language'),
				value: currentSwitcherLanguage,
				options: languageOptions.map((option) => ({ value: option, label: option.toUpperCase() })),
				onChange: handleLanguageChange,
			}}
			currency={{
				label: t('locale-currency-switcher.currency'),
				value: currency,
				options: websiteCurrencies.map((option) => ({ value: option, label: option })),
				onChange: handleCurrencyChange,
			}}
			country={{
				label: t('locale-currency-switcher.country'),
				value: chosenCountry ?? AUTOMATIC_COUNTRY,
				options: [
					{ value: AUTOMATIC_COUNTRY, label: t('locale-currency-switcher.country-automatic') },
					...COUNTRY_CODES.map((code) => ({ value: code, label: tCountries(code) })).sort((a, b) =>
						a.label.localeCompare(b.label, lang),
					),
				],
				onChange: handleCountryChange,
				searchPlaceholder: t('locale-currency-switcher.country-search'),
				emptyLabel: t('locale-currency-switcher.country-empty'),
			}}
		/>
	);
};

const SwitcherForCurrentPage = (props: Props) => <Switcher {...props} isSurveyPage={useIsPage('survey')} />;

// The pathname is unknown while prerendering dynamic routes, so the static shell assumes a non-survey page.
export const LocaleCurrencySwitcher = (props: Props) => (
	<Suspense fallback={<Switcher {...props} isSurveyPage={false} />}>
		<SwitcherForCurrentPage {...props} />
	</Suspense>
);

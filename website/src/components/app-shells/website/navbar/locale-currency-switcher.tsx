'use client';

import { useIsPage } from '@/lib/hooks/use-is-page';
import {
	isWebsiteCurrency,
	isWebsiteLanguage,
	mainWebsiteLanguages,
	toCurrencySegment,
	websiteCurrencies,
	type WebsiteCurrency,
	type WebsiteLanguage,
} from '@/lib/i18n/utils';
import { LocaleCurrencySwitcher as DesignSystemLocaleCurrencySwitcher } from '@socialincome/design-system/navigation/locale-currency-switcher/locale-currency-switcher';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Suspense, useState } from 'react';

const surveyLanguages: WebsiteLanguage[] = ['en', 'kri'];

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
};

const Switcher = ({ lang, currency, variant = 'ghost', isSurveyPage }: Props & { isSurveyPage: boolean }) => {
	const [open, setOpen] = useState(false);
	const router = useRouter();
	const t = useTranslations('website-common');

	const languageOptions = isSurveyPage ? surveyLanguages : mainWebsiteLanguages;
	const currentSwitcherLanguage = languageOptions.includes(lang) ? lang : (languageOptions[0] ?? 'en');

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
			currency={{
				label: t('locale-currency-switcher.currency'),
				value: currency,
				options: websiteCurrencies.map((option) => ({ value: option, label: option })),
				onChange: handleCurrencyChange,
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

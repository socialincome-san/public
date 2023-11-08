import { CURRENCY_COOKIE, DefaultParams } from '@/app/[lang]/[region]';
import { NavbarClient } from '@/components/navbar/navbar-client';
import { WebsiteLanguage, websiteCurrencies, websiteRegions } from '@/i18n';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { cookies } from 'next/headers';

export default async function Navbar({ lang, region }: DefaultParams) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['common', 'website-common', 'website-me'],
	});
	const supportedLanguages: WebsiteLanguage[] = ['en', 'de'];
	const currency = cookies().get(CURRENCY_COOKIE)?.value.toLowerCase();

	return (
		<NavbarClient
			lang={lang}
			region={region}
			translations={{
				language: translator.t('language'),
				currentLanguage: translator.t(`languages.${lang}`),
				region: translator.t('region'),
				currentRegion: translator.t(`regions.${region}`),
				currency: translator.t('currency'),
				currentCurrency: translator.t(`currencies.${cookies().get(CURRENCY_COOKIE)}`),
				myProfile: translator.t('navigation.my-profile'),
				contactDetails: translator.t('tabs.contact-details'),
				payments: translator.t('tabs.contributions'),
				signOut: translator.t('sign-out'),
			}}
			languages={supportedLanguages.map((lang) => ({
				code: lang,
				translation: translator.t(`languages.${lang}`),
			}))}
			regions={websiteRegions.map((country) => ({
				code: country,
				translation: translator.t(`regions.${country}`),
			}))}
			currencies={websiteCurrencies.map((currency) => ({
				code: currency,
				translation: translator.t(`currencies.${currency}`),
			}))}
			sections={[
				{
					title: translator.t('navigation.our-work'),
					href: `/${lang}/${region}/our-work`,
				},
				{
					title: translator.t('navigation.about-us'),
					href: `/${lang}/${region}/about-us`,
				},
				{
					title: translator.t('navigation.transparency'),
					links: [
						{
							title: translator.t('navigation.finances'),
							href: `/${lang}/${region}/transparency/finances/${currency}`,
							description: translator.t('navigation.finances-description'),
						},
						{
							title: translator.t('navigation.recipient-selection'),
							href: `/${lang}/${region}/transparency/recipient-selection`,
							description: translator.t('navigation.recipient-selection-description'),
						},
						{
							title: translator.t('navigation.faq'),
							href: `/${lang}/${region}/faq`,
							description: translator.t('navigation.faq-description'),
						},
					],
				},
			]}
		/>
	);
}

import { DefaultParams } from '@/app/[lang]/[region]';
import { NavbarClient } from '@/components/navbar/navbar-client';
import { WebsiteLanguage, websiteCurrencies, websiteRegions } from '@/i18n';
import { Translator } from '@socialincome/shared/src/utils/i18n';

type NavbarProps = {
	showNavigation?: boolean;
} & DefaultParams;

export default async function Navbar({ lang, region, showNavigation = true }: NavbarProps) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['common', 'website-common', 'website-me'],
	});
	const supportedLanguages: WebsiteLanguage[] = ['en', 'de'];

	return (
		<NavbarClient
			lang={lang}
			region={region}
			showNavigation={showNavigation}
			translations={{
				language: translator.t('language'),
				region: translator.t('region'),
				currency: translator.t('currency'),
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
			navigation={[
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
							href: `/${lang}/${region}/transparency/finances`,
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

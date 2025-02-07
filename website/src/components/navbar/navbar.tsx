import { DefaultParams } from '@/app/[lang]/[region]';
import { NavbarClient } from '@/components/navbar/navbar-client';
import { mainWebsiteLanguages, websiteCurrencies, websiteRegions } from '@/i18n';
import { Translator } from '@socialincome/shared/src/utils/i18n';

async function Navbar({ lang, region }: DefaultParams) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['common', 'website-common', 'website-me']
	});

	return (
		<NavbarClient
			lang={lang}
			region={region}
			translations={{
				donate: translator.t('navigation.donate'),
				language: translator.t('language'),
				region: translator.t('region'),
				currency: translator.t('currency'),
				myProfile: translator.t('navigation.my-account'),
				contactDetails: translator.t('tabs.contact-details'),
				payments: translator.t('tabs.contributions'),
				signOut: translator.t('sign-out'),
			}}
			languages={mainWebsiteLanguages.map((lang) => ({
				code: lang,
				translation: translator.t(`languages.${lang}`),
			}))}
			regions={websiteRegions.map((region) => ({
				code: region,
				translation: translator.t(`regions.${region}`),
			}))}
			currencies={websiteCurrencies.map((currency) => ({
				code: currency,
				translation: translator.t(`currencies.${currency}`),
			}))}
			navigation={[
				{
					id: 'our-work',
					title: translator.t('navigation.our-work'),
					href: `/${lang}/${region}/our-work`,
					links: [
						{ title: translator.t('navigation.contributors'), href: `/${lang}/${region}/our-work#contributors` },
						{ title: translator.t('navigation.recipients'), href: `/${lang}/${region}/our-work#recipients` },
					],
				},
				{
					id: 'about-us',
					title: translator.t('navigation.about-us'),
					href: `/${lang}/${region}/about-us`,
					links: [
						{ title: translator.t('navigation.our-mission'), href: `/${lang}/${region}/about-us#our-mission` },
						{ title: translator.t('navigation.our-promise'), href: `/${lang}/${region}/about-us#our-promise` },
						{ title: translator.t('navigation.flow-of-funds'), href: `/${lang}/${region}/about-us#flow-of-funds` },
						{ title: translator.t('navigation.team'), href: `/${lang}/${region}/about-us#team` },
						{ title: translator.t('navigation.partners'), href: `/${lang}/${region}/partners` },
					],
				},
				{
					id: 'transparency',
					href: `/${lang}/${region}/transparency/finances`,
					title: translator.t('navigation.transparency'),
					links: [
						{
							title: translator.t('navigation.finances'),
							href: `/${lang}/${region}/transparency/finances`,
						},
						{
							title: translator.t('navigation.recipient-selection'),
							href: `/${lang}/${region}/transparency/recipient-selection`,
						},
						{
							title: translator.t('navigation.evidence'),
							href: `/${lang}/${region}/transparency/evidence`,
						},
						{
							title: translator.t('navigation.reporting'),
							href: `/${lang}/${region}/transparency/reporting`,
						},
						{
							title: translator.t('navigation.faq'),
							href: `/${lang}/${region}/faq`,
						},
					],
				},
				{
					id: 'journal',
					href: `/${lang}/${region}/journal`,
					title: translator.t('navigation.journal')
				}
			]}
		/>
	);
}

export default Navbar;

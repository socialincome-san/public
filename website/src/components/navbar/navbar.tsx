import { DefaultParams } from '@/app/[lang]/[country]';
import { NavbarClient } from '@/components/navbar/navbar-client';
import { LanguageCode } from '@socialincome/shared/src/types';
import { Translator } from '@socialincome/shared/src/utils/i18n';

export type NavbarProps = {
	supportedLanguages: LanguageCode[];
} & DefaultParams;

export default async function Navbar({ lang, country, supportedLanguages }: NavbarProps) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['common', 'website-common', 'website-me'],
	});

	return (
		<NavbarClient
			lang={lang}
			country={country}
			translations={{
				currentLanguage: translator.t(`languages.${lang}`),
				myProfile: translator.t('navigation.my-profile'),
				contactDetails: translator.t('tabs.contact-details'),
				payments: translator.t('tabs.contributions'),
				signOut: translator.t('sign-out'),
			}}
			languages={supportedLanguages.map((lang) => ({ code: lang, translation: translator.t(`languages.${lang}`) }))}
			sections={[
				{
					title: translator.t('navigation.our-work'),
					links: [
						{
							title: translator.t('navigation.our-work'),
							href: `/${lang}/${country}/our-work`,
							description: translator.t('navigation.our-work-description'),
						},
						{
							title: translator.t('navigation.how-it-works'),
							href: `/${lang}/${country}/our-work`,
							description: translator.t('navigation.how-it-works-description'),
						},
						{
							title: translator.t('navigation.contributors'),
							href: `/${lang}/${country}/our-work`,
							description: translator.t('navigation.contributors-description'),
						},
					],
				},
				{
					title: translator.t('navigation.about-us'),
					links: [
						{
							title: translator.t('navigation.about-us'),
							href: `/${lang}/${country}/about-us`,
							description: translator.t('navigation.about-us-description'),
						},
						{
							title: translator.t('navigation.team'),
							href: `/${lang}/${country}/about-us/team`,
							description: translator.t('navigation.team-description'),
						},
					],
				},
				{
					title: translator.t('navigation.transparency'),
					links: [
						{
							title: translator.t('navigation.finances'),
							href: `/${lang}/${country}/transparency/finances/usd`,
							description: translator.t('navigation.finances-description'),
						},
						{
							title: translator.t('navigation.recipient-selection'),
							href: `/${lang}/${country}/transparency/recipient-selection`,
							description: translator.t('navigation.recipient-selection-description'),
						},
					],
				},
			]}
		/>
	);
}

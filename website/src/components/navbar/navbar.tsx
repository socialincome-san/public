import { DefaultParams } from '@/app/[lang]/[country]';
import NavbarClient from '@/components/navbar/navbar-client';
import { Language } from '@socialincome/shared/src/types';
import { Translator } from '@socialincome/shared/src/utils/i18n';

export default async function Navbar({ lang, country }: DefaultParams) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['common', 'website-common', 'website-me'],
	});
	const languages: Language[] = ['en', 'de'];

	const aboutUs = translator.t('navigation.about-us');
	const aboutUsHref = `/${lang}/${country}/about-us`;
	const ourWork = translator.t('navigation.our-work');
	const ourWorkHref = `/${lang}/${country}/our-work`;
	const team = translator.t('navigation.team');
	const teamHref = `/${lang}/${country}/about-us/team`;
	const transparency = translator.t('navigation.transparency');
	const transparencyHref = `/${lang}/${country}/transparency/usd`;

	return (
		<NavbarClient
			lang={lang}
			country={country}
			translations={{
				currentLanguage: translator.t(`languages.${lang}`),
				myProfile: translator.t('navigation.my-profile'),
				contactDetails: translator.t('tabs.contact-details'),
				payments: translator.t('tabs.payments'),
				signOut: translator.t('sign-out'),
			}}
			languages={languages.map((lang) => ({ code: lang, translation: translator.t(`languages.${lang}`) }))}
			sections={[
				{ title: ourWork, href: ourWorkHref },
				{
					title: aboutUs,
					href: aboutUsHref,
					links: [
						{ text: aboutUs, href: aboutUsHref },
						{ text: team, href: teamHref },
					],
				},
				{ title: transparency, href: transparencyHref },
			]}
		/>
	);
}

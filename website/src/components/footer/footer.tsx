import { DefaultLayoutProps } from '@/app/[lang]/[country]';
import { Language } from '@socialincome/shared/src/types';
import { Translator } from '@socialincome/shared/src/utils/i18n';

import { FooterClient } from '@/components/footer/footer-client';
import { BaseContainer, Typography } from '@socialincome/ui';
import { SILogo } from '@/components/logos/si-logo';
import { SiFacebook, SiInstagram, SiLinkedin, SiTwitter } from '@icons-pack/react-simple-icons';
import { EnvelopeIcon, EnvelopeOpenIcon, InformationCircleIcon, ShieldCheckIcon, UserCircleIcon, UserGroupIcon, BriefcaseIcon, SwatchIcon } from '@heroicons/react/24/solid';
import { IconType } from '@icons-pack/react-simple-icons/types';
import Link from 'next/link';
import { ValidCountry } from '@/i18n';

type FooterLinkProps = {
	label: string;
	url: string;
	Icon?: IconType;
};

function FooterLink({ label, url, Icon }: FooterLinkProps) {
	return (
		<Link
			href={url}
			target="_blank"
			className="group inline-flex items-center space-x-4"
		>
			{Icon && <Icon className="h-4 w-4 fill-neutral-600 group-hover:fill-base-content" />}
			<Typography size='sm' className="text-neutral-600 group-hover:text-base-content">{label}</Typography>
		</Link>

	)
}

type FooterProps = {
	supportedLanguages: Language[],
	supportedCountries: ValidCountry[],
} & DefaultLayoutProps;

export default async function Footer({ params, supportedLanguages, supportedCountries }: FooterProps) {
	const translator = await Translator.getInstance({
		language: params.lang,
		namespaces: ['common', 'website-common', 'website-me', 'countries'],
	});

	const supportedTranslatedLanguages = supportedLanguages.map((lang) => { return { translation: translator.t(`languages.${lang}`), code: lang } });

	const supportedTranslatedCountries = supportedCountries.map((country) => { return { translation: translator.t(`${country.toUpperCase()}`), code: country } });

	return (
		<BaseContainer className="bg-stone-300">
			<div className="flex flex-row mb-5 md:mb-10 pt-14 pl-3">
				<div className="basis-1/2 flex items-center">
					<SILogo className="h-4 fill-zinc-900" />
				</div>
				<div className="invisible md:visible basis-1/2 flex items-center gap-x-1">
					<FooterClient params={params} supportedTranslatedLanguages={supportedTranslatedLanguages} supportedTranslatedCountries={supportedTranslatedCountries} />
				</div>
			</div>
			<div>
				<hr className="my-3 border-neutral-400"></hr>
			</div>
			<div className="grid grid-cols-2 md:grid-cols-4 py-8 mx-6">
				<div className="flex flex-col space-y-2 mb-8">
					<Typography className="mb3" size="lg" weight="medium">
						Connect
					</Typography>
					<FooterLink
						Icon={EnvelopeIcon}
						label="Email"
						url="mailto:hello@socialincome.org" />
					<FooterLink
						Icon={SiInstagram}
						label="Instagram"
						url="https://www.instagram.com/so_income/" />
					<FooterLink
						Icon={SiTwitter}
						label="Twitter"
						url="https://twitter.com/so_income" />
					<FooterLink
						Icon={SiFacebook}
						label="Facebook"
						url="https://facebook.com/socialincome.org" />
					<FooterLink
						Icon={SiLinkedin}
						label="Linkedin"
						url="https://www.linkedin.com/company/socialincome" />
					<FooterLink
						Icon={EnvelopeOpenIcon}
						label="Newsletter"
						url={`/${params.lang}/${params.country}/updates`} />
				</div>
				<div className="flex flex-col space-y-2 mb-8">
					<Typography className="mb-3" size="lg" weight="medium">
						Resources
					</Typography>
					<FooterLink
						Icon={InformationCircleIcon}
						label="FAQ"
						url={`/${params.lang}/${params.country}/faq`} />
					<FooterLink
						Icon={UserCircleIcon}
						label="Account"
						url={`/${params.lang}/${params.country}/login`} />
					<FooterLink
						Icon={ShieldCheckIcon}
						label="Privacy Policy"
						url={`/${params.lang}/${params.country}/privacy`} />
					<FooterLink
						Icon={BriefcaseIcon}
						label="Terms of Use"
						url={`/${params.lang}/${params.country}/terms-use`} />
					<FooterLink
						Icon={UserGroupIcon}
						label="Terms for contributions"
						url={`/${params.lang}/${params.country}/terms-contributions`} />
					<FooterLink
						Icon={SwatchIcon}
						label="The Arts"
						url={`/${params.lang}/${params.country}/arts`} />
				</div>
				<div className="flex flex-col space-y-2 mb-8">
					<Typography className="mb-3" size="lg" weight="medium">
						Our Work
					</Typography>
					<FooterLink
						label="How It Works"
						url={`/${params.lang}/${params.country}/our-work#process`} />
					<FooterLink
						label="Contributors"
						url={`/${params.lang}/${params.country}/our-work#contributors`} />
					<FooterLink
						label="Recipients"
						url={`/${params.lang}/${params.country}/our-work#recipients`} />
					<FooterLink
						label="What's Next"
						url={`/${params.lang}/${params.country}/our-work#next`} />
				</div>
				<div className="flex flex-col space-y-2 mb-8">
					<Typography className="mb-3" size="lg" weight="medium">
						About us
					</Typography>
					<FooterLink
						label="Our Mission"
						url={`/${params.lang}/${params.country}/about-us#about-us-1`} />
					<FooterLink
						label="Why Contribute?"
						url={`/${params.lang}/${params.country}/about-us#motivations`} />
					<FooterLink
						label="Team"
						url={`/${params.lang}/${params.country}/about-us#about-us-3`} />
					<FooterLink
						label="Contact"
						url={`/${params.lang}/${params.country}/about-us#about-us-4`} />
				</div>
			</div>
			<div className="mx-6 md:invisible">
				<FooterClient params={params} supportedTranslatedLanguages={supportedTranslatedLanguages} supportedTranslatedCountries={supportedTranslatedCountries} />
			</div>
		</BaseContainer>
	);
}

import { DefaultParams } from '@/app/[lang]/[region]';
import { FooterClient } from '@/components/footer/footer-client';
import { SILogo } from '@/components/logos/si-logo';
import { websiteLanguages, websiteRegions } from '@/i18n';
import {
	BriefcaseIcon,
	EnvelopeIcon,
	EnvelopeOpenIcon,
	InformationCircleIcon,
	ShieldCheckIcon,
	UserCircleIcon,
	UserGroupIcon,
} from '@heroicons/react/24/solid';
import { SiFacebook, SiInstagram, SiLinkedin, SiTwitter } from '@icons-pack/react-simple-icons';
import { IconType } from '@icons-pack/react-simple-icons/types';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';
import Link from 'next/link';
import { HTMLAttributeAnchorTarget } from 'react';

type FooterLinkProps = {
	label: string;
	url: string;
	Icon?: IconType;
	target?: HTMLAttributeAnchorTarget;
};

function FooterLink({ label, url, Icon, target = '_self' }: FooterLinkProps) {
	return (
		<Link href={url} className="group inline-flex items-center space-x-4" target={target}>
			{Icon && <Icon className="group-hover:fill-base-content h-4 w-4 fill-neutral-600" />}
			<Typography size="sm" className="group-hover:text-base-content text-neutral-600">
				{label}
			</Typography>
		</Link>
	);
}

// TODO: i18n
export default async function Footer({ lang, region }: DefaultParams) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['common', 'website-common', 'website-me'],
	});

	const supportedTranslatedLanguages = websiteLanguages.map((lang) => {
		return { translation: translator.t(`languages.${lang}`), code: lang };
	});
	const supportedTranslatedCountries = websiteRegions.map((region) => {
		return { translation: translator.t(`regions.${region}`), code: region };
	});

	return (
		<BaseContainer backgroundColor="bg-muted" className="theme-default py-16">
			<div className="space-y-4">
				<div className="flex flex-row items-center justify-between">
					<SILogo className="fill-muted-foreground h-4" />
					<div className="hidden items-center gap-x-1 md:flex">
						<FooterClient
							lang={lang}
							region={region}
							languages={supportedTranslatedLanguages}
							regions={supportedTranslatedCountries}
						/>
					</div>
				</div>
				<hr className="border-muted-foreground"></hr>
				<div className="grid grid-cols-2 gap-8 md:grid-cols-4">
					<div className="flex flex-col space-y-2">
						<Typography className="mb-2" size="lg" weight="medium">
							Connect
						</Typography>
						<FooterLink Icon={EnvelopeIcon} label="Email" url="mailto:hello@socialincome.org" />
						<FooterLink
							Icon={SiInstagram}
							label="Instagram"
							url="https://www.instagram.com/so_income/"
							target="_blank"
						/>
						<FooterLink Icon={SiTwitter} label="Twitter" url="https://twitter.com/so_income" target="_blank" />
						<FooterLink
							Icon={SiFacebook}
							label="Facebook"
							url="https://facebook.com/socialincome.org"
							target="_blank"
						/>
						<FooterLink
							Icon={SiLinkedin}
							label="Linkedin"
							url="https://www.linkedin.com/company/socialincome"
							target="_blank"
						/>
						<FooterLink Icon={EnvelopeOpenIcon} label="Newsletter" url={`/${lang}/${region}/updates`} target="_blank" />
					</div>
					<div className="flex flex-col space-y-2">
						<Typography className="mb-2" size="lg" weight="medium">
							Resources
						</Typography>
						<FooterLink Icon={InformationCircleIcon} label="FAQ" url={`/${lang}/${region}/faq`} />
						<FooterLink Icon={UserCircleIcon} label="Account" url={`/${lang}/${region}/login`} />
						<FooterLink Icon={ShieldCheckIcon} label="Privacy Policy" url={`/${lang}/${region}/privacy`} />
						<FooterLink Icon={BriefcaseIcon} label="Terms of Use" url={`/${lang}/${region}/terms-of-use`} />
						<FooterLink
							Icon={UserGroupIcon}
							label="Terms and conditions"
							url={`/${lang}/${region}/terms-and-conditions`}
						/>
					</div>
					<div className="flex flex-col space-y-2">
						<Typography className="mb-2" size="lg" weight="medium">
							Our Work
						</Typography>
						<FooterLink label="How It Works" url={`/${lang}/${region}/our-work#process`} />
						<FooterLink label="Contributors" url={`/${lang}/${region}/our-work#contributors`} />
						<FooterLink label="Recipients" url={`/${lang}/${region}/our-work#recipients`} />
						<FooterLink label="What's Next" url={`/${lang}/${region}/our-work#next`} />
					</div>
					<div className="flex flex-col space-y-2">
						<Typography className="mb-2" size="lg" weight="medium">
							About us
						</Typography>
						<FooterLink label="Our Mission" url={`/${lang}/${region}/about-us#about-us-1`} />
						<FooterLink label="Why Contribute?" url={`/${lang}/${region}/about-us#motivations`} />
						<FooterLink label="Team" url={`/${lang}/${region}/about-us#about-us-3`} />
						<FooterLink label="Contact" url={`/${lang}/${region}/about-us#about-us-4`} />
					</div>
				</div>
				<div className="md:invisible">
					<FooterClient
						lang={lang}
						region={region}
						languages={supportedTranslatedLanguages}
						regions={supportedTranslatedCountries}
					/>
				</div>
			</div>
		</BaseContainer>
	);
}

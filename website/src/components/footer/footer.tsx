import { DefaultParams } from '@/app/[lang]/[region]';
import { FooterClient } from '@/components/footer/footer-client';
import { SILogo } from '@/components/logos/si-logo';
import { WebsiteLanguage, websiteRegions } from '@/i18n';
import { DocumentTextIcon, InformationCircleIcon, UserCircleIcon } from '@heroicons/react/24/solid';
import { SiFacebook, SiGithub, SiInstagram, SiLinkedin, SiMaildotru, SiX } from '@icons-pack/react-simple-icons';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';
import Link from 'next/link';
import { ComponentType, HTMLAttributeAnchorTarget } from 'react';

type FooterLinkProps = {
	label: string;
	url: string;
	Icon?: ComponentType<any>;
	target?: HTMLAttributeAnchorTarget;
};

function FooterLink({ label, url, Icon, target = '_self' }: FooterLinkProps) {
	return (
		<Link href={url} className="group inline-flex items-center space-x-3" target={target}>
			{Icon && <Icon className="group-hover:fill-base-content fill-muted-foreground h-4 w-4" />}
			<Typography size="sm" className="group-hover:text-base-content text-muted-foreground">
				{label}
			</Typography>
		</Link>
	);
}

export default async function Footer({ lang, region }: DefaultParams) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['common', 'website-common', 'website-me'],
	});

	const supportedTranslatedLanguages = (['de', 'en', 'it', 'fr'] as WebsiteLanguage[]).map((lang) => {
		return { translation: translator.t(`languages.${lang}`), code: lang };
	});
	const supportedTranslatedCountries = websiteRegions.map((region) => {
		return { translation: translator.t(`regions.${region}`), code: region };
	});

	return (
		<BaseContainer className="pb-8 pt-16">
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
					<div className="flex flex-col space-y-1">
						<Typography className="mb-2" size="lg" weight="medium" color="muted-foreground">
							{translator.t('footer.follow-us')}
						</Typography>
						<FooterLink
							Icon={SiInstagram}
							label="Instagram"
							url="https://www.instagram.com/so_income"
							target="_blank"
						/>
						<FooterLink Icon={SiX} label="X" url="https://twitter.com/so_income" target="_blank" />
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
						<FooterLink
							Icon={SiGithub}
							label="GitHub"
							url="https://github.com/socialincome-san/public"
							target="_blank"
						/>
						<FooterLink
							Icon={SiMaildotru}
							label={translator.t('footer.newsletter')}
							url={`/${lang}/${region}/newsletter`}
						/>
					</div>
					<div className="flex flex-col space-y-1">
						<Typography className="mb-2" size="lg" weight="medium" color="muted-foreground">
							{translator.t('footer.resources')}
						</Typography>
						<FooterLink
							Icon={InformationCircleIcon}
							label={translator.t('navigation.faq')}
							url={`/${lang}/${region}/faq`}
						/>
						<FooterLink
							Icon={UserCircleIcon}
							label={translator.t('navigation.my-account')}
							url={`/${lang}/${region}/login`}
						/>
						<FooterLink Icon={DocumentTextIcon} label={translator.t('footer.legal')} url={`/${lang}/${region}/legal`} />
					</div>
					<div className="flex flex-col space-y-1">
						<Typography className="mb-2" size="lg" weight="medium" color="muted-foreground">
							{translator.t('navigation.our-work')}
						</Typography>
						<FooterLink
							label={translator.t('navigation.how-it-works')}
							url={`/${lang}/${region}/our-work#how-it-works`}
						/>
						<FooterLink
							label={translator.t('navigation.contributors')}
							url={`/${lang}/${region}/our-work#contributors`}
						/>
						<FooterLink label={translator.t('navigation.recipients')} url={`/${lang}/${region}/our-work#recipients`} />
						<FooterLink label={translator.t('navigation.whats-next')} url={`/${lang}/${region}/our-work#whats-next`} />
					</div>
					<div className="flex flex-col space-y-1">
						<Typography className="mb-2" size="lg" weight="medium" color="muted-foreground">
							{translator.t('navigation.about-us')}
						</Typography>
						<FooterLink
							label={translator.t('navigation.our-mission')}
							url={`/${lang}/${region}/about-us#our-mission`}
						/>
						<FooterLink label={translator.t('navigation.team')} url={`/${lang}/${region}/about-us#team`} />
					</div>
				</div>
				<div className="flex flex-col md:hidden">
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

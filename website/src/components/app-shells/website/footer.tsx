import { FacebookIcon } from '@/components/svg/facebook';
import { GithubIcon } from '@/components/svg/github';
import { InstagramIcon } from '@/components/svg/instagram';
import { LinkedinIcon } from '@/components/svg/linkedin';
import { PaperPlaneIcon } from '@/components/svg/paper-plane';
import { SocialIncomeLogo } from '@/components/svg/social-income-logo';
import { Layout, MenuItem } from '@/generated/storyblok/types/109655/storyblok-components';
import { Translator } from '@/lib/i18n/translator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import { resolveStoryblokLink } from '@/lib/services/storyblok/storyblok.utils';
import { STORYBLOK_LAYOUT_PATH } from '@/lib/storyblok/storyblok-paths';
import { now } from '@/lib/utils/now';
import { ISbStoryData } from '@storyblok/js';
import NextImage from 'next/image';
import NextLink from 'next/link';

type Props = {
	lang: WebsiteLanguage;
	region: string;
};

const IconMap: Record<NonNullable<Exclude<MenuItem['icon'], ''>>, React.ComponentType<{ className?: string }>> = {
	instagram: InstagramIcon,
	linkedin: LinkedinIcon,
	facebook: FacebookIcon,
	github: GithubIcon,
	newsletter: PaperPlaneIcon,
};

export const Footer = async ({ lang, region }: Props) => {
	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-common'] });
	const result = await services.storyblok.getStoryWithFallback<ISbStoryData<Layout>>(STORYBLOK_LAYOUT_PATH, lang);
	const layoutContent = result.success ? result.data.content : undefined;
	const footerMenu = layoutContent?.footerMenu ?? [];
	const copyrightNotice = layoutContent?.copyrightNotice;
	const supportedByLogo = layoutContent?.supportedByLogo;
	const supportedByLink = layoutContent?.supportedByUrl;
	const supportedByDetails =
		layoutContent?.supportedByLabel && supportedByLogo?.filename
			? {
					label: layoutContent.supportedByLabel,
					logoFilename: supportedByLogo.filename,
					logoAlt: supportedByLogo.alt ?? '',
				}
			: null;
	const supportedByHref = supportedByLink ? resolveStoryblokLink(supportedByLink, lang, region) : undefined;
	const supportedByLinkProps =
		supportedByHref && supportedByHref !== '#'
			? {
					href: supportedByHref,
					target: supportedByLink?.target,
					rel: supportedByLink?.target === '_blank' ? 'noopener noreferrer' : undefined,
				}
			: null;

	return (
		<div className="bg-primary max-w-content mx-auto grid w-full grid-cols-1 gap-4 rounded-t-3xl px-8 pt-10 pb-8 text-white sm:px-16 sm:pt-14 lg:mb-10 lg:grid-cols-[334px_auto] lg:rounded-3xl">
			<div className="flex flex-col">
				<SocialIncomeLogo width={222} height={22} />
				{supportedByDetails && (
					<div className="mt-8 flex flex-col gap-2 lg:mt-auto">
						<p className="text-xs leading-normal font-medium text-white/50">{supportedByDetails.label}</p>
						{supportedByLinkProps ? (
							<NextLink
								href={supportedByLinkProps.href}
								target={supportedByLinkProps.target}
								rel={supportedByLinkProps.rel}
								className="w-fit"
								aria-label={translator.t('footer.supported-by-link-aria')}
							>
								<NextImage src={supportedByDetails.logoFilename} alt="" width={120} height={22} />
							</NextLink>
						) : (
							<NextImage
								src={supportedByDetails.logoFilename}
								alt={supportedByDetails.logoAlt !== '' ? supportedByDetails.logoAlt : supportedByDetails.label}
								width={120}
								height={22}
							/>
						)}
					</div>
				)}
			</div>
			<div className="mt-8 lg:mt-16">
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
					{footerMenu.map((menuGroup) => (
						<div key={menuGroup._uid}>
							<h2 className="text-lg font-bold text-white">{menuGroup.label}</h2>
							<ul className="mt-4 space-y-3">
								{menuGroup.items?.map((item) => {
									const Icon = item.icon ? IconMap[item.icon] : null;

									return (
										<li key={item._uid}>
											<NextLink
												href={resolveStoryblokLink(item.link, lang, region)}
												target={item.newTab ? '_blank' : '_self'}
												rel={item.newTab ? 'noopener noreferrer' : undefined}
												className="flex items-center gap-3 font-medium text-white/50 transition-colors hover:text-white"
											>
												{Icon && <Icon className="text-input" />}
												{item.label}
											</NextLink>
										</li>
									);
								})}
							</ul>
						</div>
					))}
				</div>
				{copyrightNotice && (
					<div className="mt-16">
						<p className="text-xs font-medium text-white/50">
							{copyrightNotice.replace('%YEAR%', now().getFullYear().toString())}
						</p>
					</div>
				)}
			</div>
		</div>
	);
};

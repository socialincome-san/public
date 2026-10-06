import { Layout } from '@/generated/storyblok/types/109655/storyblok-components';
import { Translator } from '@/lib/i18n/translator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { STORYBLOK_LAYOUT_PATH } from '@/lib/storyblok/storyblok-paths';
import { resolveStoryblokLink } from '@/lib/storyblok/storyblok-utils';
import { now } from '@/lib/utils/now';
import { getStoryWithFallbackAction } from '@/modules/storyblok-content/storyblok-content.actions';
import { SiteFooter, type SiteFooterSupportedBy } from '@socialincome/design-system/navigation/site-footer/site-footer';
import { ISbStoryData } from '@storyblok/js';

type Props = {
	lang: WebsiteLanguage;
	region: string;
};

export const Footer = async ({ lang, region }: Props) => {
	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-common'] });
	const result = await getStoryWithFallbackAction<ISbStoryData<Layout>>({
		storyPath: STORYBLOK_LAYOUT_PATH,
		language: lang,
	});
	const layoutContent = result.success ? result.data.content : undefined;
	const supportedByLogo = layoutContent?.supportedByLogo;
	const supportedByLink = layoutContent?.supportedByUrl;
	const supportedByHref = supportedByLink ? resolveStoryblokLink(supportedByLink, lang, region) : undefined;
	const supportedBy: SiteFooterSupportedBy | undefined =
		layoutContent?.supportedByLabel && supportedByLogo?.filename
			? {
					label: layoutContent.supportedByLabel,
					logoSrc: supportedByLogo.filename,
					logoAlt: supportedByLogo.alt === '' ? null : supportedByLogo.alt,
					link:
						supportedByHref && supportedByHref !== '#'
							? {
									href: supportedByHref,
									target: supportedByLink?.target,
									ariaLabel: translator.t('footer.supported-by-link-aria'),
								}
							: undefined,
				}
			: undefined;

	return (
		<SiteFooter
			groups={(layoutContent?.footerMenu ?? []).map((group) => ({
				id: group._uid,
				label: group.label,
				links: (group.items ?? []).map((item) => ({
					id: item._uid,
					label: item.label,
					href: resolveStoryblokLink(item.link, lang, region),
					newTab: item.newTab,
					icon: item.icon === '' ? undefined : item.icon,
				})),
			}))}
			copyright={layoutContent?.copyrightNotice?.replace('%YEAR%', now().getFullYear().toString())}
			supportedBy={supportedBy}
		/>
	);
};

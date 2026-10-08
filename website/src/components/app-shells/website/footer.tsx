import { Layout } from '@/generated/storyblok/types/109655/storyblok-components';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { STORYBLOK_LAYOUT_PATH } from '@/lib/storyblok/storyblok-paths';
import { resolveStoryblokLink } from '@/lib/storyblok/storyblok-utils';
import { now } from '@/lib/utils/now';
import { getStoryWithFallbackAction } from '@/modules/storyblok-content/storyblok-content.actions';
import { SiteFooter, type SiteFooterSupportedBy } from '@socialincome/design-system/navigation/site-footer/site-footer';
import { ISbStoryData } from '@storyblok/js';
import { getTranslations } from 'next-intl/server';
import { cacheLife } from 'next/cache';

type Props = {
	lang: WebsiteLanguage;
	region: string;
};

const getCurrentYear = async () => {
	'use cache';
	cacheLife('days');

	return Promise.resolve(now().getFullYear());
};

export const Footer = async ({ lang, region }: Props) => {
	const [t, result, currentYear] = await Promise.all([
		getTranslations('website-common'),
		getStoryWithFallbackAction<ISbStoryData<Layout>>({
			storyPath: STORYBLOK_LAYOUT_PATH,
			language: lang,
		}),
		getCurrentYear(),
	]);
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
									ariaLabel: t('footer.supported-by-link-aria'),
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
			copyright={layoutContent?.copyrightNotice?.replace('%YEAR%', currentYear.toString())}
			supportedBy={supportedBy}
		/>
	);
};

import type { Study } from '@/generated/storyblok/types/109655/storyblok-components';
import type { WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { resolveStoryblokLink } from '@/lib/storyblok/storyblok-utils';
import { isSafeHref } from '@/lib/utils/string-utils';
import { LinkPill } from '@socialincome/design-system/actions/link-pill/link-pill';
import { ExpandableCard } from '@socialincome/design-system/data-display/expandable-card/expandable-card';
import type { ISbStoryData } from '@storyblok/js';
import { getTranslations } from 'next-intl/server';

type Props = {
	study: ISbStoryData<Study>;
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
};

export const StudyCard = async ({ study, lang, currency }: Props) => {
	const t = await getTranslations('website-common');
	const { title, description, subtitle, year, link, linkText } = study.content;
	const metadata = [subtitle?.trim(), year?.trim()].filter(Boolean).join(', ');
	const linkLabel = linkText?.trim();
	const resolvedHref = link ? resolveStoryblokLink(link, lang, currency) : null;
	const href = resolvedHref && resolvedHref !== '#' && isSafeHref(resolvedHref) ? resolvedHref : null;

	return (
		<ExpandableCard
			title={title}
			description={description}
			meta={metadata || undefined}
			action={href && linkLabel ? <LinkPill href={href} label={linkLabel} external /> : undefined}
			closeLabel={t('focuses-page.close')}
		/>
	);
};

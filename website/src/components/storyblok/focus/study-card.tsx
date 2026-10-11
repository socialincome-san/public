import type { Study } from '@/generated/storyblok/types/109655/storyblok-components';
import type { WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { resolveStoryblokLink } from '@/lib/storyblok/storyblok-utils';
import { isSafeHref } from '@/lib/utils/string-utils';
import { LinkPill } from '@socialincome/design-system/actions/link-pill/link-pill';
import type { ISbStoryData } from '@storyblok/js';

type Props = {
	study: ISbStoryData<Study>;
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
};

export const StudyCard = ({ study, lang, currency }: Props) => {
	const { title, description, subtitle, year, link, linkText } = study.content;
	const metadata = [subtitle?.trim(), year?.trim()].filter(Boolean).join(', ');
	const linkLabel = linkText?.trim();
	const resolvedHref = link ? resolveStoryblokLink(link, lang, currency) : null;
	const href = resolvedHref && resolvedHref !== '#' && isSafeHref(resolvedHref) ? resolvedHref : null;

	return (
		<article className="border-border bg-card shadow-card flex flex-col gap-4 rounded-3xl border px-10 py-8">
			<h3 className="text-foreground line-clamp-3 text-2xl font-bold">{title}</h3>
			<p className="text-foreground line-clamp-5 text-base font-normal">{description}</p>
			{metadata && <p className="text-foreground text-base font-light">{metadata}</p>}
			{href && linkLabel && <LinkPill href={href} label={linkLabel} external />}
		</article>
	);
};

import type { Study } from '@/generated/storyblok/types/109655/storyblok-components';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { resolveStoryblokLink } from '@/lib/services/storyblok/storyblok.utils';
import { isSafeHref } from '@/lib/utils/string-utils';
import type { ISbStoryData } from '@storyblok/js';
import { ExternalLink } from 'lucide-react';
import Link from 'next/link';

type Props = {
	study: ISbStoryData<Study>;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
};

export const StudyCard = ({ study, lang, region }: Props) => {
	const { title, description, subtitle, year, link, linkText } = study.content;
	const metadata = [subtitle?.trim(), year?.trim()].filter(Boolean).join(', ');
	const linkLabel = linkText?.trim();
	const resolvedHref = link ? resolveStoryblokLink(link, lang, region) : null;
	const href = resolvedHref && resolvedHref !== '#' && isSafeHref(resolvedHref) ? resolvedHref : null;

	return (
		<article className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white px-10 py-8 shadow-[0_4px_6px_-4px_rgba(0,0,0,0.10),0_0_20px_0_rgba(0,0,0,0.05)]">
			<h3 className="text-foreground line-clamp-3 text-2xl font-bold">{title}</h3>
			<p className="text-foreground line-clamp-3 font-sans text-base font-normal">{description}</p>
			{metadata && <p className="text-foreground text-base font-light">{metadata}</p>}
			{href && linkLabel && (
				<Link
					href={href}
					target="_blank"
					rel="noopener noreferrer"
					className="inline-flex w-fit items-center gap-1.5 rounded-full bg-slate-100 py-1.5 pr-2 pl-3"
				>
					<span className="text-foreground text-xs font-bold">{linkLabel}</span>
					<ExternalLink className="text-foreground size-3.5" aria-hidden="true" />
				</Link>
			)}
		</article>
	);
};

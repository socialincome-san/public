import { Badge } from '@/components/badge';
import type { FocusStory } from '@/components/storyblok/focus/focus.types';
import { getFocusSlug, getFocusTitle } from '@/components/storyblok/focus/focus.utils';
import type { StoryblokMultilink } from '@/generated/storyblok/types/storyblok';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { resolveStoryblokLink } from '@/lib/services/storyblok/storyblok.utils';
import { NEW_WEBSITE_SLUG } from '@/lib/utils/const';
import { isSafeHref } from '@/lib/utils/string-utils';
import Link from 'next/link';

type ExternalLink = {
	label: string;
	link: StoryblokMultilink | undefined;
};

type FocusBadgesProps = {
	lang: WebsiteLanguage;
	region: WebsiteRegion;
	focuses: FocusStory[];
};

export const LocalPartnerFocusBadges = ({ lang, region, focuses }: FocusBadgesProps) => {
	if (focuses.length === 0) {
		return null;
	}

	return (
		<div className="flex flex-wrap gap-2">
			{focuses.map((focusStory) => {
				const focusTitle = getFocusTitle(focusStory.content);
				const focusSlug = getFocusSlug(focusStory);

				return (
					<Link key={focusStory.uuid} href={`/${lang}/${region}/${NEW_WEBSITE_SLUG}/focuses/${focusSlug}`}>
						<Badge variant="outline" className="border-sky-300 bg-sky-50 text-sky-700 transition-colors hover:bg-sky-100">
							{focusTitle}
						</Badge>
					</Link>
				);
			})}
		</div>
	);
};

type AboutMetaCardProps = {
	lang: WebsiteLanguage;
	region: WebsiteRegion;
	mission?: string;
	partnerSince?: string;
	foundingYear?: string;
	location?: string;
	externalLinks: ExternalLink[];
};

export const LocalPartnerAboutMetaCard = ({
	lang,
	region,
	mission,
	partnerSince,
	foundingYear,
	location,
	externalLinks,
}: AboutMetaCardProps) => {
	const resolvedExternalLinks = externalLinks
		.map(({ label, link }) => {
			const resolvedHref = resolveStoryblokLink(link, lang, region);

			return resolvedHref && resolvedHref !== '#' && isSafeHref(resolvedHref) ? { label, href: resolvedHref } : null;
		})
		.filter((value): value is { label: string; href: string } => value !== null);

	const hasMeta =
		Boolean(mission) ||
		Boolean(partnerSince) ||
		Boolean(foundingYear) ||
		Boolean(location) ||
		resolvedExternalLinks.length > 0;
	if (!hasMeta) {
		return null;
	}

	return (
		<div className="mt-2 rounded-2xl border border-slate-200 bg-white p-6">
			<div className="grid gap-6 lg:grid-cols-2">
				{mission ? (
					<div className="lg:col-span-2">
						<p className="text-sm font-semibold text-slate-600">Mission</p>
						<p className="mt-2 text-base text-slate-900">{mission}</p>
					</div>
				) : null}

				<div className="space-y-3">
					{partnerSince ? (
						<div className="flex items-baseline justify-between gap-4">
							<p className="text-sm text-slate-600">Partner since</p>
							<p className="text-sm font-medium text-slate-900">{partnerSince}</p>
						</div>
					) : null}
					{foundingYear ? (
						<div className="flex items-baseline justify-between gap-4">
							<p className="text-sm text-slate-600">Founded</p>
							<p className="text-sm font-medium text-slate-900">{foundingYear}</p>
						</div>
					) : null}
					{location ? (
						<div className="flex items-baseline justify-between gap-4">
							<p className="text-sm text-slate-600">Location</p>
							<p className="text-sm font-medium text-slate-900">{location}</p>
						</div>
					) : null}
				</div>

				{resolvedExternalLinks.length > 0 ? (
					<div>
						<p className="text-sm font-semibold text-slate-600">Online</p>
						<div className="mt-3 flex flex-wrap gap-2">
							{resolvedExternalLinks.map(({ label, href }) => (
								<Link
									key={label}
									href={href}
									target="_blank"
									rel="noopener noreferrer"
									className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-100"
								>
									{label}
								</Link>
							))}
						</div>
					</div>
				) : null}
			</div>
		</div>
	);
};

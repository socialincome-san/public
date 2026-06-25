import { Badge } from '@/components/badge';
import type { FocusStory } from '@/components/storyblok/focus/focus.types';
import { getFocusSlug, getFocusTitle } from '@/components/storyblok/focus/focus.utils';
import type { StoryblokMultilink } from '@/generated/storyblok/types/storyblok';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { resolveStoryblokLink } from '@/lib/services/storyblok/storyblok.utils';
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
					<Link key={focusStory.uuid} href={`/${lang}/${region}/focuses/${focusSlug}`}>
						<Badge
							variant="outline"
							className="border-accent bg-accent text-accent-foreground hover:bg-accent/80 transition-colors"
						>
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
		<div className="border-border bg-card mt-2 rounded-2xl border p-6">
			<div className="grid gap-6 lg:grid-cols-2">
				{mission ? (
					<div className="lg:col-span-2">
						<p className="text-muted-foreground text-sm font-bold">Mission</p>
						<p className="text-foreground mt-2 text-base">{mission}</p>
					</div>
				) : null}

				<div className="space-y-3">
					{partnerSince ? (
						<div className="flex items-baseline justify-between gap-4">
							<p className="text-muted-foreground text-sm">Partner since</p>
							<p className="text-foreground text-sm font-medium">{partnerSince}</p>
						</div>
					) : null}
					{foundingYear ? (
						<div className="flex items-baseline justify-between gap-4">
							<p className="text-muted-foreground text-sm">Founded</p>
							<p className="text-foreground text-sm font-medium">{foundingYear}</p>
						</div>
					) : null}
					{location ? (
						<div className="flex items-baseline justify-between gap-4">
							<p className="text-muted-foreground text-sm">Location</p>
							<p className="text-foreground text-sm font-medium">{location}</p>
						</div>
					) : null}
				</div>

				{resolvedExternalLinks.length > 0 ? (
					<div>
						<p className="text-muted-foreground text-sm font-bold">Online</p>
						<div className="mt-3 flex flex-wrap gap-2">
							{resolvedExternalLinks.map(({ label, href }) => (
								<Link
									key={label}
									href={href}
									target="_blank"
									rel="noopener noreferrer"
									className="text-foreground border-border bg-muted/50 hover:bg-muted rounded-full border px-3 py-1 text-sm font-medium transition-colors"
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

import { Badge } from '@/components/badge/badge';
import type { FocusStory } from '@/components/storyblok/focus/focus.types';
import { getFocusSlug, getFocusTitle } from '@/components/storyblok/focus/focus.utils';
import type { StoryblokMultilink } from '@/generated/storyblok/types/storyblok';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { resolveStoryblokLink } from '@/lib/services/storyblok/storyblok.utils';
import { cn } from '@/lib/utils/cn';
import { isSafeHref } from '@/lib/utils/string-utils';
import { ArrowUpRight } from 'lucide-react';
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

	const facts = [
		{ label: 'Partner since', value: partnerSince },
		{ label: 'Founded', value: foundingYear },
		{ label: 'Location', value: location },
	].filter((fact): fact is { label: string; value: string } => Boolean(fact.value));

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
			<div className="space-y-6">
				{mission ? (
					<div>
						<p className="text-muted-foreground text-sm">Mission</p>
						<p className="text-foreground mt-2 text-lg">{mission}</p>
					</div>
				) : null}

				<div className="space-y-4">
					{facts.length > 0 ? (
						<div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
							{facts.map(({ label, value }) => (
								<div key={label} className="flex items-baseline justify-between gap-4 sm:block">
									<p className="text-muted-foreground text-sm">{label}</p>
									<p className="text-foreground text-base font-medium sm:mt-1 sm:text-2xl">{value}</p>
								</div>
							))}
						</div>
					) : null}
					{resolvedExternalLinks.length > 0 ? (
						<div
							className={cn(
								'flex items-baseline justify-between gap-4',
								facts.length > 0 && 'border-border mt-6 border-t pt-6',
							)}
						>
							<p className="text-muted-foreground shrink-0 text-sm">Learn more</p>
							<div className="flex min-w-0 flex-wrap justify-end gap-2">
								{resolvedExternalLinks.map(({ label, href }) => (
									<Link
										key={label}
										href={href}
										target="_blank"
										rel="noopener noreferrer"
										className="text-foreground border-border bg-muted/50 hover:bg-muted flex items-center gap-1 rounded-full border px-3 py-1 text-sm font-medium transition-colors"
									>
										{label}
										<ArrowUpRight className="size-3" aria-hidden="true" />
										<span className="sr-only"> (opens in a new tab)</span>
									</Link>
								))}
							</div>
						</div>
					) : null}
				</div>
			</div>
		</div>
	);
};

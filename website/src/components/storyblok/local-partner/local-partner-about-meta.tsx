import type { FocusStory } from '@/components/storyblok/focus/focus.types';
import { getFocusSlug, getFocusTitle } from '@/components/storyblok/focus/focus.utils';
import type { Person } from '@/generated/storyblok/types/109655/storyblok-components';
import type { StoryblokMultilink } from '@/generated/storyblok/types/storyblok';
import type { WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { getWebsiteBasePath } from '@/lib/i18n/utils';
import { createWebsitePersonLink, getPersonDisplayName, resolveStoryblokLink } from '@/lib/storyblok/storyblok-utils';
import { isSafeHref } from '@/lib/utils/string-utils';
import { cn } from '@socialincome/design-system/cn';
import { Badge } from '@socialincome/design-system/data-display/badge/badge';
import type { ISbStoryData } from '@storyblok/js';
import { ArrowUpRight, BadgeCheck } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import type { ReactNode } from 'react';

type ExternalLink = {
	label: string;
	link: StoryblokMultilink | undefined;
};

type FocusBadgesProps = {
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
	focuses: FocusStory[];
};

export const LocalPartnerFocusBadges = ({ lang, currency, focuses }: FocusBadgesProps) => {
	if (focuses.length === 0) {
		return null;
	}

	return (
		<div className="flex flex-wrap gap-2">
			{focuses.map((focusStory) => {
				const focusTitle = getFocusTitle(focusStory.content);
				const focusSlug = getFocusSlug(focusStory);

				return (
					<Link key={focusStory.uuid} href={`${getWebsiteBasePath(lang, currency)}/focuses/${focusSlug}`}>
						<Badge variant="outline">{focusTitle}</Badge>
					</Link>
				);
			})}
		</div>
	);
};

type AboutMetaCardProps = {
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
	mission?: string;
	partnerSince?: string;
	foundingYear?: string;
	location?: string;
	externalLinks: ExternalLink[];
	assessmentLead?: ISbStoryData<Person>;
	assessmentReviewer?: ISbStoryData<Person>;
};

export const LocalPartnerAboutMetaCard = async ({
	lang,
	currency,
	mission,
	partnerSince,
	foundingYear,
	location,
	externalLinks,
	assessmentLead,
	assessmentReviewer,
}: AboutMetaCardProps) => {
	const t = await getTranslations('website-common');
	const resolvedExternalLinks = externalLinks
		.map(({ label, link }) => {
			const resolvedHref = resolveStoryblokLink(link, lang, currency);

			return resolvedHref && resolvedHref !== '#' && isSafeHref(resolvedHref) ? { label, href: resolvedHref } : null;
		})
		.filter((value): value is { label: string; href: string } => value !== null);

	const facts = [
		{ label: t('local-partners-page.partner-since'), value: partnerSince },
		{ label: t('local-partners-page.founded'), value: foundingYear },
		{ label: t('local-partners-page.location'), value: location },
	].filter((fact): fact is { label: string; value: string } => Boolean(fact.value));

	const hasMeta =
		Boolean(mission) ||
		Boolean(partnerSince) ||
		Boolean(foundingYear) ||
		Boolean(location) ||
		resolvedExternalLinks.length > 0 ||
		Boolean(assessmentLead);
	if (!hasMeta) {
		return null;
	}

	const personLink = (person: ISbStoryData<Person>) => (chunks: ReactNode) => (
		<Link
			href={createWebsitePersonLink(person.slug, lang, currency)}
			className="inline-flex items-center gap-0.5 underline-offset-4 hover:underline"
		>
			{chunks}
			<ArrowUpRight className="size-3" aria-hidden="true" />
		</Link>
	);

	return (
		<div className="border-border bg-card mt-2 overflow-hidden rounded-2xl border">
			<div className="space-y-6 p-6">
				{mission ? (
					<div>
						<p className="text-muted-foreground text-sm">{t('local-partners-page.mission')}</p>
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
							<p className="text-muted-foreground shrink-0 text-sm">{t('local-partners-page.learn-more')}</p>
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
										<span className="sr-only"> {t('local-partners-page.opens-in-new-tab')}</span>
									</Link>
								))}
							</div>
						</div>
					) : null}
				</div>
			</div>
			{assessmentLead ? (
				<div className="border-border bg-muted/40 text-muted-foreground flex items-start gap-2 border-t px-6 py-4 text-sm">
					<BadgeCheck className="mt-0.5 size-4 shrink-0" strokeWidth={1.7} aria-hidden="true" />
					<p>
						{assessmentReviewer
							? t.rich('local-partners-page.assessment-with-reviewer', {
									lead: getPersonDisplayName(assessmentLead),
									reviewer: getPersonDisplayName(assessmentReviewer),
									leadLink: personLink(assessmentLead),
									reviewerLink: personLink(assessmentReviewer),
								})
							: t.rich('local-partners-page.assessment', {
									lead: getPersonDisplayName(assessmentLead),
									leadLink: personLink(assessmentLead),
								})}
					</p>
				</div>
			) : null}
		</div>
	);
};

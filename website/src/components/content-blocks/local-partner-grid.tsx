import { blockMargins } from '@/components/content-blocks/block-margins';
import {
	hasActiveRecipients,
	limitGridLocalPartners,
	localPartnerMatchesGridFilter,
	sortGridLocalPartners,
} from '@/components/content-blocks/local-partner-grid.utils';
import { resolveSelectedStories } from '@/components/content-blocks/overview-grid.utils';
import { findSelectedStory } from '@/components/content-blocks/program-grid-view';
import { StoryblokMarkdown } from '@/components/storyblok-markdown';
import type { LocalPartnerStory } from '@/components/storyblok/local-partner/local-partner.types';
import { getLocalPartnerPortalSlug } from '@/components/storyblok/local-partner/local-partner.utils';
import { LocalPartnersGrid } from '@/components/storyblok/local-partner/local-partners-grid';
import type { LocalPartnerGrid } from '@/generated/storyblok/types/109655/storyblok-components';
import type { WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { resolveStoryblokLink } from '@/lib/storyblok/storyblok-utils';
import { getLocalPartnerOverviewStatsAction } from '@/modules/local-partners/local-partner.actions';
import { getCountriesAction, getLocalPartnersAction } from '@/modules/storyblok-content/storyblok-content.actions';
import { Button } from '@socialincome/design-system/actions/button/button';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import { SectionHeading } from '@socialincome/design-system/layout/section-heading/section-heading';
import { storyblokEditable } from '@storyblok/react';
import { getTranslations } from 'next-intl/server';
import NextLink from 'next/link';

const resolveGridFilterValue = async (blok: LocalPartnerGrid, lang: WebsiteLanguage) => {
	switch (blok.filterBy) {
		case 'country': {
			const country = await findSelectedStory(blok.filterCountry, () => getCountriesAction(lang));

			return country?.content.isoCode?.toString().trim();
		}
		case 'focus':
			return typeof blok.filterFocus === 'string' ? blok.filterFocus : blok.filterFocus?.uuid;
		default:
			return undefined;
	}
};

const getCandidateLocalPartners = async (
	blok: LocalPartnerGrid,
	allLocalPartners: LocalPartnerStory[],
	lang: WebsiteLanguage,
) => {
	if (!blok.filterBy) {
		return blok.showAllLocalPartners ? allLocalPartners : resolveSelectedStories(blok.localPartners, allLocalPartners);
	}
	const value = await resolveGridFilterValue(blok, lang);
	if (!value) {
		return [];
	}
	const filter = { by: blok.filterBy, value };

	return allLocalPartners.filter((localPartner) => localPartnerMatchesGridFilter(localPartner, filter));
};

type Props = {
	blok: LocalPartnerGrid;
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
};

export const LocalPartnerGridBlock = async ({ blok, lang, currency }: Props) => {
	const localPartnersResult = await getLocalPartnersAction(lang);
	const allLocalPartners = localPartnersResult.success ? localPartnersResult.data : [];
	const candidates = await getCandidateLocalPartners(blok, allLocalPartners, lang);
	const portalSlugs = candidates.map((localPartner) => getLocalPartnerPortalSlug(localPartner.content)).filter(Boolean);
	const [statsResult, t] = await Promise.all([
		getLocalPartnerOverviewStatsAction(portalSlugs),
		getTranslations('website-common'),
	]);
	const statsByPortalSlug = statsResult.success ? statsResult.data : {};
	const visibleLocalPartners = blok.hideInactiveLocalPartners
		? candidates.filter((localPartner) => hasActiveRecipients(localPartner, statsByPortalSlug))
		: candidates;
	const localPartners = limitGridLocalPartners(
		sortGridLocalPartners(visibleLocalPartners, blok.sortBy, statsByPortalSlug, lang),
		blok.maxLocalPartners,
	);
	if (localPartners.length === 0) {
		return null;
	}

	const button = blok.button?.[0];
	const buttonHref = button?.link ? resolveStoryblokLink(button.link, lang, currency) : null;

	return (
		<BlockWrapper {...blockMargins(blok)} {...storyblokEditable(blok)}>
			{blok.heading && (
				<div className="mb-8 md:mb-10">
					<SectionHeading size={3}>
						<StoryblokMarkdown>{blok.heading}</StoryblokMarkdown>
					</SectionHeading>
				</div>
			)}
			{blok.description && (
				<div className="text-foreground -mt-4 mb-10 text-center text-lg leading-7 font-normal whitespace-pre-line">
					<StoryblokMarkdown>{blok.description}</StoryblokMarkdown>
				</div>
			)}
			<LocalPartnersGrid
				localPartners={localPartners}
				statsByPortalSlug={statsByPortalSlug}
				lang={lang}
				currency={currency}
			/>
			{buttonHref && (
				<div className="mt-10 flex justify-center">
					<Button variant="outline" asChild>
						<NextLink href={buttonHref}>{t('local-partners-page.view-all', { count: allLocalPartners.length })}</NextLink>
					</Button>
				</div>
			)}
		</BlockWrapper>
	);
};

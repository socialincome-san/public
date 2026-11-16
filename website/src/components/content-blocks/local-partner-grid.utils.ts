import type { LocalPartnerStory } from '@/components/storyblok/local-partner/local-partner.types';
import {
	getLocalPartnerIsoCode,
	getLocalPartnerPortalSlug,
	getLocalPartnerTitle,
} from '@/components/storyblok/local-partner/local-partner.utils';
import type { LocalPartnerGrid } from '@/generated/storyblok/types/109655/storyblok-components';
import type { PublicLocalPartnerOverviewStatsMap } from '@/modules/local-partners/local-partner.types';

export type LocalPartnerGridFilter = {
	by: 'country' | 'focus';
	value: string;
};

const getStoryUuid = (story: { uuid: string } | string) => (typeof story === 'string' ? story : story.uuid);

export const localPartnerMatchesGridFilter = (localPartner: LocalPartnerStory, filter: LocalPartnerGridFilter) => {
	switch (filter.by) {
		case 'country':
			return getLocalPartnerIsoCode(localPartner.content)?.toLowerCase() === filter.value.toLowerCase();
		case 'focus':
			return (localPartner.content.focuses ?? []).some((focus) => getStoryUuid(focus) === filter.value);
	}
};

export const hasActiveRecipients = (
	localPartner: LocalPartnerStory,
	statsByPortalSlug: PublicLocalPartnerOverviewStatsMap,
) => {
	const stats = statsByPortalSlug[getLocalPartnerPortalSlug(localPartner.content)];

	return Boolean(stats && stats.recipientsCount > 0 && !stats.isConcluded);
};

const getPublishedTime = (localPartner: LocalPartnerStory) =>
	Date.parse(localPartner.first_published_at ?? localPartner.created_at) || 0;

export const sortGridLocalPartners = (
	localPartners: LocalPartnerStory[],
	sortBy: LocalPartnerGrid['sortBy'],
	statsByPortalSlug: PublicLocalPartnerOverviewStatsMap,
	lang: string,
) => {
	const getRecipientsCount = (localPartner: LocalPartnerStory) =>
		statsByPortalSlug[getLocalPartnerPortalSlug(localPartner.content)]?.recipientsCount ?? 0;

	switch (sortBy) {
		case 'newest':
			return localPartners.toSorted((a, b) => getPublishedTime(b) - getPublishedTime(a));
		case 'recipients':
			return localPartners.toSorted((a, b) => getRecipientsCount(b) - getRecipientsCount(a));
		case 'alphabetical':
			return localPartners.toSorted((a, b) =>
				getLocalPartnerTitle(a.content).localeCompare(getLocalPartnerTitle(b.content), lang),
			);
		default:
			return localPartners;
	}
};

export const limitGridLocalPartners = (
	localPartners: LocalPartnerStory[],
	maxLocalPartners: LocalPartnerGrid['maxLocalPartners'],
) => (maxLocalPartners ? localPartners.slice(0, Number(maxLocalPartners)) : localPartners);

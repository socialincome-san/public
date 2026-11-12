import type { LocalPartnerStory } from '@/components/storyblok/local-partner/local-partner.types';
import type { PublicLocalPartnerOverviewStatsMap } from '@/modules/local-partners/local-partner.types';
import {
	hasActiveRecipients,
	limitGridLocalPartners,
	localPartnerMatchesGridFilter,
	sortGridLocalPartners,
} from './local-partner-grid.utils';

const createLocalPartner = (
	portalSlug: string,
	title: string,
	countryIsoCode: string,
	focuses: LocalPartnerStory['content']['focuses'],
	firstPublishedAt: string,
) =>
	({
		uuid: portalSlug,
		slug: portalSlug,
		created_at: '2020-01-01T00:00:00.000Z',
		first_published_at: firstPublishedAt,
		content: { portalSlug, title, countryIsoCode, focuses, component: 'Local Partner', _uid: portalSlug },
	}) as LocalPartnerStory;

const aurora = createLocalPartner('aurora', 'Aurora', 'SL', ['focus-health'], '2024-05-01T00:00:00.000Z');
const baobab = createLocalPartner('baobab', 'Baobab', 'KE', ['focus-education'], '2025-02-01T00:00:00.000Z');
const cedar = createLocalPartner(
	'cedar',
	'Cedar',
	'SL',
	[{ uuid: 'focus-education' } as NonNullable<LocalPartnerStory['content']['focuses']>[number]],
	'2023-01-01T00:00:00.000Z',
);
const localPartners = [aurora, baobab, cedar];

const stats: PublicLocalPartnerOverviewStatsMap = {
	aurora: { recipientsCount: 10, candidatesCount: 0, isConcluded: false },
	baobab: { recipientsCount: 40, candidatesCount: 0, isConcluded: true },
	cedar: { recipientsCount: 0, candidatesCount: 3, isConcluded: false },
};

const slugs = (stories: LocalPartnerStory[]) => stories.map(({ slug }) => slug);

describe('localPartnerMatchesGridFilter', () => {
	const matching = (filter: Parameters<typeof localPartnerMatchesGridFilter>[1]) =>
		slugs(localPartners.filter((localPartner) => localPartnerMatchesGridFilter(localPartner, filter)));

	it('matches the country case-insensitively', () => {
		expect(matching({ by: 'country', value: 'sl' })).toEqual(['aurora', 'cedar']);
	});

	it('matches focuses stored as uuids or as resolved stories', () => {
		expect(matching({ by: 'focus', value: 'focus-education' })).toEqual(['baobab', 'cedar']);
	});
});

describe('hasActiveRecipients', () => {
	it('needs recipients in a running program', () => {
		expect(slugs(localPartners.filter((localPartner) => hasActiveRecipients(localPartner, stats)))).toEqual(['aurora']);
	});
});

describe('sortGridLocalPartners', () => {
	const shuffled = [cedar, aurora, baobab];

	it('sorts alphabetically', () => {
		expect(slugs(sortGridLocalPartners(shuffled, 'alphabetical', stats, 'en'))).toEqual(['aurora', 'baobab', 'cedar']);
	});

	it('sorts by most recipients', () => {
		expect(slugs(sortGridLocalPartners(shuffled, 'recipients', stats, 'en'))).toEqual(['baobab', 'aurora', 'cedar']);
	});

	it('sorts newest first', () => {
		expect(slugs(sortGridLocalPartners(shuffled, 'newest', stats, 'en'))).toEqual(['baobab', 'aurora', 'cedar']);
	});

	it('keeps the given order without a sort', () => {
		expect(slugs(sortGridLocalPartners(shuffled, '', stats, 'en'))).toEqual(['cedar', 'aurora', 'baobab']);
	});
});

describe('limitGridLocalPartners', () => {
	it('limits to the maximum, or keeps all when empty', () => {
		expect(limitGridLocalPartners([...localPartners, ...localPartners], '3')).toEqual(localPartners);
		expect(limitGridLocalPartners(localPartners, '')).toHaveLength(3);
	});
});

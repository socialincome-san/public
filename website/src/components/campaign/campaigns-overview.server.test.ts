import type { CampaignStory } from '@/components/storyblok/campaign/campaign.types';
import type { CampaignCmsJoin } from '@/lib/services/campaign/campaign.types';
import { resolveCampaignsWithCmsEntries } from './campaigns-overview.server';

const createStory = (portalSlug: string, storySlug: string): CampaignStory =>
	({
		slug: storySlug,
		full_slug: `pages/campaigns/${storySlug}`,
		content: {
			component: 'Campaign',
			portalSlug,
			title: 'CMS title',
			description: 'Description',
			creatorName: 'CMS creator',
			primaryImage: { filename: 'https://a.storyblok.com/f/109655/image.jpg', alt: 'Cover', focus: '0x0:100x100' },
			_uid: 'uid',
		},
	}) as CampaignStory;

const createDbCampaign = (slug: string): CampaignCmsJoin => ({
	id: `id-${slug}`,
	slug,
	currency: 'CHF',
	endDate: new Date('2025-12-31T00:00:00.000Z'),
	goal: 10_000,
	isActive: false,
});

describe('resolveCampaignsWithCmsEntries', () => {
	test('includes campaigns when Storyblok story matches DB slug regardless of DB visibility flags', () => {
		const stories = [createStory('pending-campaign', 'pending-campaign')];
		const databaseCampaigns = [createDbCampaign('pending-campaign')];

		const result = resolveCampaignsWithCmsEntries(stories, databaseCampaigns, {});

		expect(result.campaigns).toHaveLength(1);
		expect(result.campaigns[0]?.title).toBe('CMS title');
		expect(result.campaigns[0]?.creatorName).toBe('CMS creator');
		expect(result.campaigns[0]?.slug).toBe('pending-campaign');
		expect(result.campaigns[0]?.primaryImage).toEqual({
			filename: 'https://a.storyblok.com/f/109655/image.jpg',
			alt: 'Cover',
			focus: '0x0:100x100',
		});
	});

	test('skips stories without portalSlug or missing DB match', () => {
		const stories = [createStory('', 'missing-portal-slug'), createStory('unknown-slug', 'unknown-slug')];
		const databaseCampaigns = [createDbCampaign('known-slug')];

		const result = resolveCampaignsWithCmsEntries(stories, databaseCampaigns, {});

		expect(result.campaigns).toHaveLength(0);
	});
});

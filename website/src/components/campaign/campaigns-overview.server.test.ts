import type { CampaignStory } from '@/components/storyblok/campaign/campaign.types';
import type { PublicCampaignCard } from '@/lib/services/campaign/campaign.types';
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
			primaryImage: { filename: 'image.jpg' },
			_uid: 'uid',
		},
	}) as CampaignStory;

const createDbCampaign = (slug: string): PublicCampaignCard => ({
	id: `id-${slug}`,
	title: 'DB title',
	slug,
	creatorName: null,
	currency: 'CHF',
	isActive: false,
});

describe('resolveCampaignsWithCmsEntries', () => {
	test('includes campaigns when Storyblok story matches DB slug regardless of DB visibility flags', () => {
		const stories = [createStory('pending-campaign', 'pending-campaign')];
		const databaseCampaigns = [createDbCampaign('pending-campaign')];

		const result = resolveCampaignsWithCmsEntries(stories, databaseCampaigns, {});

		expect(result.campaigns).toHaveLength(1);
		expect(result.campaigns[0]?.title).toBe('CMS title');
		expect(result.campaigns[0]?.slug).toBe('pending-campaign');
	});

	test('skips stories without portalSlug or missing DB match', () => {
		const stories = [createStory('', 'missing-portal-slug'), createStory('unknown-slug', 'unknown-slug')];
		const databaseCampaigns = [createDbCampaign('known-slug')];

		const result = resolveCampaignsWithCmsEntries(stories, databaseCampaigns, {});

		expect(result.campaigns).toHaveLength(0);
	});
});

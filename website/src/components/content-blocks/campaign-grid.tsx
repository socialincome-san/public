import { CampaignsGridSection } from '@/components/campaign/campaigns-grid-section';
import type { Campaign, CampaignGrid } from '@/generated/storyblok/types/109655/storyblok-components';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import type { ISbStoryData } from '@storyblok/js';
import type { SbBlokData } from '@storyblok/react';

type Props = {
	blok: CampaignGrid;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
};

const getSelectedCampaignSlugs = (entries: (ISbStoryData<Campaign> | string)[] | undefined) => {
	if (!entries?.length) {
		return [];
	}

	const slugs: string[] = [];

	for (const entry of entries) {
		const slug = (typeof entry === 'string' ? entry : entry.content.id).trim();
		if (slug) {
			slugs.push(slug);
		}
	}

	return slugs;
};

export const CampaignGridBlock = async ({ blok, lang, region }: Props) => {
	const allResult = await services.read.campaign.getAllPublicCampaignsWithStats();
	if (!allResult.success) {
		return null;
	}

	const campaigns = blok.showAllCampaigns
		? allResult.data.campaigns
		: services.read.campaign.resolvePublicCampaignsBySlugs(
				getSelectedCampaignSlugs(blok.campaigns),
				allResult.data.campaigns,
			);

	if (campaigns.length === 0) {
		return null;
	}

	const dataResult = await services.read.campaign.getPublicCampaignsWithStats(campaigns);
	if (!dataResult.success) {
		return null;
	}

	return <CampaignsGridSection data={dataResult.data} lang={lang} region={region} blok={blok as SbBlokData} />;
};

import { BlockWrapper } from '@/components/block-wrapper';
import { resolveSelectedStories } from '@/components/content-blocks/overview-grid.utils';
import { getCampaignId } from '@/components/storyblok/campaign/campaign.utils';
import { CampaignsOverview } from '@/components/storyblok/campaign/campaigns-overview';
import type { CampaignGrid } from '@/generated/storyblok/types/109655/storyblok-components';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import { storyblokEditable, type SbBlokData } from '@storyblok/react';

type Props = {
	blok: CampaignGrid;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
};

export const CampaignGridBlock = async ({ blok, lang, region }: Props) => {
	const campaignsResult = await services.storyblok.getCampaigns(lang);
	const allCampaigns = campaignsResult.success ? campaignsResult.data : [];
	const campaigns = blok.showAllCampaigns ? allCampaigns : resolveSelectedStories(blok.campaigns, allCampaigns);
	const campaignIds = [...new Set(campaigns.map((campaign) => getCampaignId(campaign.content)).filter(Boolean))];
	const statsResult = await services.read.campaign.getPublicCampaignStatsByIds(campaignIds);
	const statsById = statsResult.success ? statsResult.data : {};

	return (
		<BlockWrapper {...storyblokEditable(blok as SbBlokData)}>
			<CampaignsOverview campaigns={campaigns} statsById={statsById} lang={lang} region={region} />
		</BlockWrapper>
	);
};

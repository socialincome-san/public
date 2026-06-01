import { CampaignsOverview } from '@/components/campaign/campaigns-overview';
import type { CampaignOverview } from '@/generated/storyblok/types/109655/storyblok-components';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import type { ISbStoryData } from '@storyblok/js';

type Props = {
	overview: ISbStoryData<CampaignOverview>;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
};

export const CampaignsOverviewPage = async ({ overview, lang, region }: Props) => {
	const campaignsResult = await services.read.campaign.getAllPublicCampaignsWithStats();
	const campaignsData = campaignsResult.success ? campaignsResult.data : { campaigns: [], statsById: {} };
	const title = overview.content.title?.trim() ?? overview.name;
	const text = overview.content.text?.trim();

	return (
		<div className="w-site-width max-w-content mx-auto flex flex-col gap-8 px-6 py-8">
			<CampaignsOverview
				campaigns={campaignsData.campaigns}
				statsById={campaignsData.statsById}
				lang={lang}
				region={region}
				title={title}
				text={text}
			/>
		</div>
	);
};

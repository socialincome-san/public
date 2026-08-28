import { BlockWrapper } from '@/components/block-wrapper';
import { CampaignsGridSection } from '@/components/campaign/campaigns-grid-section';
import { resolveCampaignsWithCmsEntries } from '@/components/campaign/campaigns-overview.server';
import type { CampaignStory } from '@/components/storyblok/campaign/campaign.types';
import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';

const TEASER_LIMIT = 3;

type Props = {
	currentCampaignSlug: string;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
};

export const CampaignOtherCampaignsTeaser = async ({ currentCampaignSlug, lang, region }: Props) => {
	const [translator, campaignStoriesResult, campaignsResult] = await Promise.all([
		Translator.getInstance({ language: lang, namespaces: ['website-campaign'] }),
		services.storyblok.getCampaigns(lang),
		services.read.campaign.getAllCampaignsForCmsJoinWithStats({ activity: 'active' }),
	]);

	const campaignStories = (campaignStoriesResult.success ? campaignStoriesResult.data : []) as CampaignStory[];
	const campaignsData = campaignsResult.success ? campaignsResult.data : { campaigns: [], statsById: {} };
	const resolved = resolveCampaignsWithCmsEntries(campaignStories, campaignsData.campaigns, campaignsData.statsById);
	const campaigns = resolved.campaigns.filter((campaign) => campaign.slug !== currentCampaignSlug).slice(0, TEASER_LIMIT);

	if (campaigns.length === 0) {
		return null;
	}

	const campaignIds = new Set(campaigns.map((campaign) => campaign.id));
	const statsById = Object.fromEntries(
		Object.entries(resolved.statsById).filter(([campaignId]) => campaignIds.has(campaignId)),
	);

	return (
		<BlockWrapper>
			<CampaignsGridSection
				heading={
					<>
						{translator.t('campaign.other-campaigns.heading-prefix')}
						<strong>{translator.t('campaign.other-campaigns.heading-emphasis')}</strong>
					</>
				}
				data={{ campaigns, statsById }}
				lang={lang}
				region={region}
				cta={{
					href: `/${lang}/${region}/campaigns`,
					label: translator.t('campaign.other-campaigns.show-all'),
				}}
			/>
		</BlockWrapper>
	);
};

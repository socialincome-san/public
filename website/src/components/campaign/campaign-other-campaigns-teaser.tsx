import { CampaignsGridSection } from '@/components/campaign/campaigns-grid-section';
import { resolveCampaignsWithCmsEntries } from '@/components/campaign/campaigns-overview.server';
import type { CampaignStory } from '@/components/storyblok/campaign/campaign.types';
import type { WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { getWebsiteBasePath } from '@/lib/i18n/utils';
import { getAllCampaignsForCmsJoinWithStatsAction } from '@/modules/campaigns/campaign.actions';
import { getCampaignsAction } from '@/modules/storyblok-content/storyblok-content.actions';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import { getTranslations } from 'next-intl/server';

const TEASER_LIMIT = 3;

type Props = {
	currentCampaignSlug: string;
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
};

export const CampaignOtherCampaignsTeaser = async ({ currentCampaignSlug, lang, currency }: Props) => {
	const [t, campaignStoriesResult, campaignsResult] = await Promise.all([
		getTranslations('website-campaign'),
		getCampaignsAction(lang),
		getAllCampaignsForCmsJoinWithStatsAction('active'),
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
						{t('campaign.other-campaigns.heading-prefix')}
						<strong>{t('campaign.other-campaigns.heading-emphasis')}</strong>
					</>
				}
				data={{ campaigns, statsById }}
				lang={lang}
				currency={currency}
				cta={{
					href: `${getWebsiteBasePath(lang, currency)}/campaigns`,
					label: t('campaign.other-campaigns.show-all'),
				}}
			/>
		</BlockWrapper>
	);
};

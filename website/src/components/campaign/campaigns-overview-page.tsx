import { Breadcrumb } from '@/components/breadcrumb/breadcrumb';
import { buildBreadcrumbLinks } from '@/components/breadcrumb/build-breadcrumb-links';
import { CampaignsOverview } from '@/components/campaign/campaigns-overview';
import { getStateQuery, resolveCampaignsWithCmsEntries } from '@/components/campaign/campaigns-overview.server';
import type { CampaignStory } from '@/components/storyblok/campaign/campaign.types';
import type { CampaignOverview } from '@/generated/storyblok/types/109655/storyblok-components';
import { getWebsiteRootParams } from '@/lib/i18n/website-root-params';
import { services } from '@/lib/services/services';
import type { AnySearchParams } from '@/lib/types/page-props';
import type { ISbStoryData } from '@storyblok/js';
import { BlockWrapper } from '../block-wrapper';

type Props = {
	overview: ISbStoryData<CampaignOverview>;
	searchParams?: AnySearchParams;
};

export const CampaignsOverviewPage = async ({ overview, searchParams }: Props) => {
	const { lang, region } = await getWebsiteRootParams();
	const selectedState = getStateQuery(searchParams);
	const [campaignStoriesResult, campaignsResult] = await Promise.all([
		services.storyblok.getCampaigns(lang),
		// Activity filter is applied in CampaignsOverview via isCampaignPubliclyActive.
		services.read.campaign.getAllCampaignsForCmsJoinWithStats({ activity: 'all' }),
	]);
	const campaignStories = (campaignStoriesResult.success ? campaignStoriesResult.data : []) as CampaignStory[];
	const campaignsData = campaignsResult.success ? campaignsResult.data : { campaigns: [], statsById: {} };
	const { campaigns, statsById } = resolveCampaignsWithCmsEntries(
		campaignStories,
		campaignsData.campaigns,
		campaignsData.statsById,
	);
	const title = overview.content.title?.trim() ?? overview.name;
	const text = overview.content.text?.trim();
	const breadcrumbLinks = await buildBreadcrumbLinks({
		fullSlug: overview.full_slug,
		currentLabel: title,
		lang,
		region,
	});

	return (
		<div className="flex flex-col gap-8 py-8">
			<Breadcrumb links={breadcrumbLinks} className="py-0" />
			<BlockWrapper disableMarginTop={true} disableMarginBottom={true}>
				<CampaignsOverview
					campaigns={campaigns}
					statsById={statsById}
					title={title}
					text={text}
					showStateFilter={true}
					selectedState={selectedState}
				/>
			</BlockWrapper>
		</div>
	);
};

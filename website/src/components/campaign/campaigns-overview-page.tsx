import { Breadcrumb } from '@/components/breadcrumb/breadcrumb';
import { buildBreadcrumbLinks } from '@/components/breadcrumb/build-breadcrumb-links';
import { CampaignsOverview } from '@/components/campaign/campaigns-overview';
import { getStateQuery } from '@/components/campaign/campaigns-overview.server';
import type { CampaignOverview } from '@/generated/storyblok/types/109655/storyblok-components';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import type { AnySearchParams } from '@/lib/types/page-props';
import type { ISbStoryData } from '@storyblok/js';
import { BlockWrapper } from '../block-wrapper';

type Props = {
	overview: ISbStoryData<CampaignOverview>;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
	searchParams?: AnySearchParams;
};

export const CampaignsOverviewPage = async ({ overview, lang, region, searchParams }: Props) => {
	const selectedState = getStateQuery(searchParams);
	const campaignsResult = await services.read.campaign.getAllPublicCampaignsWithStats({ activity: selectedState });
	const campaignsData = campaignsResult.success ? campaignsResult.data : { campaigns: [], statsById: {} };
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
					campaigns={campaignsData.campaigns}
					statsById={campaignsData.statsById}
					lang={lang}
					region={region}
					title={title}
					text={text}
					showStateFilter={true}
					selectedState={selectedState}
				/>
			</BlockWrapper>
		</div>
	);
};

import type { AnySearchParams } from '@/app/page-props';
import { Breadcrumb } from '@/components/breadcrumb/breadcrumb';
import { buildBreadcrumbLinks } from '@/components/breadcrumb/build-breadcrumb-links';
import { CampaignsOverview } from '@/components/campaign/campaigns-overview';
import { getStateQuery, resolveCampaignsWithCmsEntries } from '@/components/campaign/campaigns-overview.server';
import type { CampaignStory } from '@/components/storyblok/campaign/campaign.types';
import type { CampaignOverview } from '@/generated/storyblok/types/109655/storyblok-components';
import type { WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { getAllCampaignsForCmsJoinWithStatsAction } from '@/modules/campaigns/campaign.actions';
import { getCampaignsAction } from '@/modules/storyblok-content/storyblok-content.actions';
import { AppLoadingSkeleton } from '@socialincome/design-system/feedback/app-loading-skeleton/app-loading-skeleton';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import { PageIntro } from '@socialincome/design-system/layout/page-intro/page-intro';
import type { ISbStoryData } from '@storyblok/js';
import { Suspense } from 'react';

type Props = {
	overview: ISbStoryData<CampaignOverview>;
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
	searchParams: Promise<AnySearchParams>;
};

const FilteredCampaigns = async ({ lang, currency, searchParams }: Omit<Props, 'overview'>) => {
	const [campaignStoriesResult, campaignsResult, resolvedSearchParams] = await Promise.all([
		getCampaignsAction(lang),
		// Activity filter is applied in CampaignsOverview via isCampaignPubliclyActive.
		getAllCampaignsForCmsJoinWithStatsAction('all'),
		searchParams,
	]);
	const campaignStories = (campaignStoriesResult.success ? campaignStoriesResult.data : []) as CampaignStory[];
	const campaignsData = campaignsResult.success ? campaignsResult.data : { campaigns: [], statsById: {} };
	const { campaigns, statsById } = resolveCampaignsWithCmsEntries(
		campaignStories,
		campaignsData.campaigns,
		campaignsData.statsById,
	);

	return (
		<CampaignsOverview
			campaigns={campaigns}
			statsById={statsById}
			lang={lang}
			currency={currency}
			showStateFilter={true}
			selectedState={getStateQuery(resolvedSearchParams)}
		/>
	);
};

export const CampaignsOverviewPage = async ({ overview, lang, currency, searchParams }: Props) => {
	const title = overview.content.title?.trim() ?? overview.name;
	const text = overview.content.text?.trim();
	const breadcrumbLinks = await buildBreadcrumbLinks({
		fullSlug: overview.full_slug,
		currentLabel: title,
		lang,
		currency,
	});

	return (
		<div className="flex flex-col gap-8 py-8">
			<Breadcrumb links={breadcrumbLinks} layout="section" />
			<BlockWrapper disableMarginTop={true} disableMarginBottom={true}>
				<div className="flex w-full flex-col gap-8">
					<PageIntro title={title} description={text} />
					<Suspense fallback={<AppLoadingSkeleton />}>
						<FilteredCampaigns lang={lang} currency={currency} searchParams={searchParams} />
					</Suspense>
				</div>
			</BlockWrapper>
		</div>
	);
};

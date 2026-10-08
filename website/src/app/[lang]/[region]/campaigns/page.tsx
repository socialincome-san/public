import { DefaultPageProps } from '@/app/[lang]/[region]';
import { CampaignsOverviewPage } from '@/components/campaign/campaigns-overview-page';
import type { CampaignOverview } from '@/generated/storyblok/types/109655/storyblok-components';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { getCampaignsOverviewStoryPath } from '@/lib/storyblok/storyblok-paths';
import { getStoryWithFallback } from '@/modules/storyblok-content/storyblok-content.cache';
import type { ISbStoryData } from '@storyblok/js';
import { notFound } from 'next/navigation';

export default async function CampaignsOverviewRoute({ params, searchParams }: DefaultPageProps) {
	const { lang, region } = await params;
	const overviewResult = await getStoryWithFallback<ISbStoryData<CampaignOverview>>(getCampaignsOverviewStoryPath(), lang);

	if (!overviewResult.success) {
		return notFound();
	}

	return (
		<CampaignsOverviewPage
			overview={overviewResult.data}
			lang={lang as WebsiteLanguage}
			region={region as WebsiteRegion}
			searchParams={searchParams}
		/>
	);
}

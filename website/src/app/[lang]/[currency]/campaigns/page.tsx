import { DefaultLayoutProps, DefaultPageProps } from '@/app/[lang]/[currency]';
import { CampaignsOverviewPage } from '@/components/campaign/campaigns-overview-page';
import type { CampaignOverview } from '@/generated/storyblok/types/109655/storyblok-components';
import { toWebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { getCampaignsOverviewStoryPath } from '@/lib/storyblok/storyblok-paths';
import { getWebsiteAlternates } from '@/lib/utils/metadata';
import { getStoryWithFallback } from '@/modules/storyblok-content/storyblok-content.cache';
import type { ISbStoryData } from '@storyblok/js';
import { notFound } from 'next/navigation';

export const generateMetadata = async ({ params }: DefaultLayoutProps) =>
	getWebsiteAlternates((await params).lang as WebsiteLanguage, 'campaigns');

export default async function CampaignsOverviewRoute({ params, searchParams }: DefaultPageProps) {
	const { lang, currency } = await params;
	const overviewResult = await getStoryWithFallback<ISbStoryData<CampaignOverview>>(getCampaignsOverviewStoryPath(), lang);

	if (!overviewResult.success) {
		return notFound();
	}

	return (
		<CampaignsOverviewPage
			overview={overviewResult.data}
			lang={lang as WebsiteLanguage}
			currency={toWebsiteCurrency(currency)}
			searchParams={searchParams}
		/>
	);
}

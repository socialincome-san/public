import { DefaultLayoutProps } from '@/app/[lang]/[currency]';
import { StoryblokPreviewCampaignsOverviewPage } from '@/components/storyblok/storyblok-preview-campaigns-overview-page';
import { getWebsiteBasePath, toWebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { getCampaignsOverviewStoryPath } from '@/lib/storyblok/storyblok-paths';

type PreviewPageProps = DefaultLayoutProps & {
	searchParams: Promise<Record<string, string | undefined>>;
};

export default async function CampaignsOverviewPreviewRoute({ params, searchParams }: PreviewPageProps) {
	const { lang, currency } = await params;
	const resolvedSearchParams = await searchParams;

	return (
		<StoryblokPreviewCampaignsOverviewPage
			storyPath={getCampaignsOverviewStoryPath()}
			lang={lang as WebsiteLanguage}
			currency={toWebsiteCurrency(currency)}
			previewRoutePath={`${getWebsiteBasePath(lang, toWebsiteCurrency(currency))}/campaigns/preview`}
			searchParams={resolvedSearchParams}
		/>
	);
}

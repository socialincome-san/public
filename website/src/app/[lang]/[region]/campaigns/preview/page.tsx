import { DefaultLayoutProps } from '@/app/[lang]/[region]';
import { StoryblokPreviewCampaignsOverviewPage } from '@/components/storyblok/storyblok-preview-campaigns-overview-page';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { getCampaignsOverviewStoryPath } from '@/lib/storyblok/storyblok-paths';

type PreviewPageProps = DefaultLayoutProps & {
	searchParams: Promise<Record<string, string | undefined>>;
};

export default async function CampaignsOverviewPreviewRoute({ params, searchParams }: PreviewPageProps) {
	const { lang, region } = await params;
	const resolvedSearchParams = await searchParams;

	return (
		<StoryblokPreviewCampaignsOverviewPage
			storyPath={getCampaignsOverviewStoryPath()}
			lang={lang as WebsiteLanguage}
			region={region as WebsiteRegion}
			previewRoutePath={`/${lang}/${region}/campaigns/preview`}
			searchParams={resolvedSearchParams}
		/>
	);
}

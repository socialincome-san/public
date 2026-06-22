import { DefaultLayoutProps } from '@/app/[lang]/[region]';
import { StoryblokPreviewLocalPartnersOverviewPage } from '@/components/storyblok/storyblok-preview-local-partners-overview-page';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { getLocalPartnersOverviewStoryPath } from '@/lib/storyblok/storyblok-paths';

type PreviewPageProps = DefaultLayoutProps & {
	searchParams: Promise<Record<string, string | undefined>>;
};

export default async function LocalPartnersOverviewPreviewRoute({ params, searchParams }: PreviewPageProps) {
	const { lang, region } = await params;
	const resolvedSearchParams = await searchParams;

	return (
		<StoryblokPreviewLocalPartnersOverviewPage
			storyPath={getLocalPartnersOverviewStoryPath()}
			lang={lang as WebsiteLanguage}
			region={region as WebsiteRegion}
			previewRoutePath={`/${lang}/${region}/local-partners/preview`}
			searchParams={resolvedSearchParams}
		/>
	);
}

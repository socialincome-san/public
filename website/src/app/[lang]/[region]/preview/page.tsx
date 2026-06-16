import { DefaultPageProps } from '@/app/[lang]/[region]';
import { StoryblokPreviewPage } from '@/components/storyblok/storyblok-preview-page';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { getHomeStoryPath } from '@/lib/storyblok/storyblok-paths';

type PreviewPageProps = DefaultPageProps & {
	searchParams: Promise<Record<string, string | undefined>>;
};

export default async function PreviewPage({ params, searchParams }: PreviewPageProps) {
	const { lang, region } = await params;
	const resolvedSearchParams = await searchParams;

	return (
		<StoryblokPreviewPage
			storyPath={getHomeStoryPath()}
			lang={lang as WebsiteLanguage}
			region={region as WebsiteRegion}
			previewRoutePath={`/${lang}/${region}/preview`}
			searchParams={resolvedSearchParams}
		/>
	);
}

import { DefaultLayoutProps } from '@/app/[lang]/[region]';
import { StoryblokPreviewProgramsOverviewPage } from '@/components/storyblok/storyblok-preview-programs-overview-page';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { getProgramsOverviewStoryPath } from '@/lib/storyblok/storyblok-paths';

type PreviewPageProps = DefaultLayoutProps & {
	searchParams: Promise<Record<string, string | undefined>>;
};

export default async function ProgramsOverviewPreviewRoute({ params, searchParams }: PreviewPageProps) {
	const { lang, region } = await params;
	const resolvedSearchParams = await searchParams;

	return (
		<StoryblokPreviewProgramsOverviewPage
			storyPath={getProgramsOverviewStoryPath()}
			lang={lang as WebsiteLanguage}
			region={region as WebsiteRegion}
			previewRoutePath={`/${lang}/${region}/programs/preview`}
			searchParams={resolvedSearchParams}
		/>
	);
}

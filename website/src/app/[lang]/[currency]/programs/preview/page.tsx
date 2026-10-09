import { DefaultLayoutProps } from '@/app/[lang]/[currency]';
import { StoryblokPreviewProgramsOverviewPage } from '@/components/storyblok/storyblok-preview-programs-overview-page';
import { getWebsiteBasePath, toWebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { getProgramsOverviewStoryPath } from '@/lib/storyblok/storyblok-paths';

type PreviewPageProps = DefaultLayoutProps & {
	searchParams: Promise<Record<string, string | undefined>>;
};

export default async function ProgramsOverviewPreviewRoute({ params, searchParams }: PreviewPageProps) {
	const { lang, currency } = await params;
	const resolvedSearchParams = await searchParams;

	return (
		<StoryblokPreviewProgramsOverviewPage
			storyPath={getProgramsOverviewStoryPath()}
			lang={lang as WebsiteLanguage}
			currency={toWebsiteCurrency(currency)}
			previewRoutePath={`${getWebsiteBasePath(lang, toWebsiteCurrency(currency))}/programs/preview`}
			searchParams={resolvedSearchParams}
		/>
	);
}

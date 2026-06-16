import { DefaultLayoutProps } from '@/app/[lang]/[region]';
import { StoryblokPreviewFocusesOverviewPage } from '@/components/storyblok/storyblok-preview-focuses-overview-page';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { getFocusesOverviewStoryPath } from '@/lib/storyblok/storyblok-paths';
import { NEW_WEBSITE_SLUG } from '@/lib/utils/const';

type PreviewPageProps = DefaultLayoutProps & {
	searchParams: Promise<Record<string, string | undefined>>;
};

export default async function FocusesOverviewPreviewRoute({ params, searchParams }: PreviewPageProps) {
	const { lang, region } = await params;
	const resolvedSearchParams = await searchParams;

	return (
		<StoryblokPreviewFocusesOverviewPage
			storyPath={getFocusesOverviewStoryPath()}
			lang={lang as WebsiteLanguage}
			region={region as WebsiteRegion}
			previewRoutePath={`/${lang}/${region}/${NEW_WEBSITE_SLUG}/focuses/preview`}
			searchParams={resolvedSearchParams}
		/>
	);
}

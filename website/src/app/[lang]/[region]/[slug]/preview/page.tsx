import { DefaultLayoutProps, DefaultParams } from '@/app/[lang]/[region]';
import { StoryblokPreviewPage } from '@/components/storyblok/storyblok-preview-page';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { getPageStoryPath } from '@/lib/storyblok/storyblok-paths';

type PreviewPageProps = DefaultLayoutProps<DefaultParams & { slug: string }> & {
	searchParams: Promise<Record<string, string | undefined>>;
};

export default async function PreviewPage({ params, searchParams }: PreviewPageProps) {
	const { slug, lang, region } = await params;
	const resolvedSearchParams = await searchParams;

	return (
		<StoryblokPreviewPage
			storyPath={getPageStoryPath(slug)}
			lang={lang as WebsiteLanguage}
			region={region as WebsiteRegion}
			previewRoutePath={`/${lang}/${region}/${slug}/preview`}
			searchParams={resolvedSearchParams}
		/>
	);
}

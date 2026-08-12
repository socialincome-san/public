import { DefaultLayoutProps, DefaultParams } from '@/app/[lang]/[region]';
import { StoryblokPreviewFocusPage } from '@/components/storyblok/storyblok-preview-focus-page';
import type { WebsiteLanguage } from '@/lib/i18n/utils';
import { getFocusStoryPath } from '@/lib/storyblok/storyblok-paths';

type PreviewPageProps = DefaultLayoutProps<DefaultParams & { slug: string }> & {
	searchParams: Promise<Record<string, string | undefined>>;
};

export default async function FocusPreviewRoute({ params, searchParams }: PreviewPageProps) {
	const { slug, lang, region } = await params;
	const resolvedSearchParams = await searchParams;

	return (
		<StoryblokPreviewFocusPage
			storyPath={getFocusStoryPath(slug)}
			slug={slug}
			lang={lang as WebsiteLanguage}
			previewRoutePath={`/${lang}/${region}/focuses/${slug}/preview`}
			searchParams={resolvedSearchParams}
		/>
	);
}

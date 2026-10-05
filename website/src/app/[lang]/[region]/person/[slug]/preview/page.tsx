import { StoryblokPreviewPersonPage } from '@/components/storyblok/storyblok-preview-person-page';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { getPersonStoryPath } from '@/lib/storyblok/storyblok-paths';

type PreviewPageProps = {
	params: Promise<{ slug: string; lang: WebsiteLanguage; region: WebsiteRegion }>;
	searchParams: Promise<Record<string, string | undefined>>;
};

export default async function PreviewPersonPage({ params, searchParams }: PreviewPageProps) {
	const { slug, lang, region } = await params;
	const resolvedSearchParams = await searchParams;

	return (
		<StoryblokPreviewPersonPage
			storyPath={getPersonStoryPath(slug)}
			slug={slug}
			lang={lang}
			region={region}
			previewRoutePath={`/${lang}/${region}/person/${slug}/preview`}
			searchParams={resolvedSearchParams}
		/>
	);
}

import { DefaultLayoutProps, DefaultParams } from '@/app/[lang]/[region]';
import { StoryblokPreviewPersonPage } from '@/components/storyblok/storyblok-preview-person-page';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { getPersonStoryPath } from '@/lib/storyblok/storyblok-paths';
import { NEW_WEBSITE_SLUG } from '@/lib/utils/const';

type PreviewPageProps = DefaultLayoutProps<DefaultParams & { slug: string }> & {
	searchParams: Promise<Record<string, string | undefined>>;
};

export default async function PreviewPersonPage({ params, searchParams }: PreviewPageProps) {
	const { slug, lang, region } = await params;
	const resolvedSearchParams = await searchParams;

	return (
		<StoryblokPreviewPersonPage
			storyPath={getPersonStoryPath(slug)}
			slug={slug}
			lang={lang as WebsiteLanguage}
			region={region as WebsiteRegion}
			previewRoutePath={`/${lang}/${region}/${NEW_WEBSITE_SLUG}/person/${slug}/preview`}
			searchParams={resolvedSearchParams}
		/>
	);
}

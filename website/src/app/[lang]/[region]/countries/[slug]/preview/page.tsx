import { DefaultLayoutProps, DefaultParams } from '@/app/[lang]/[region]';
import { StoryblokPreviewCountryPage } from '@/components/storyblok/storyblok-preview-country-page';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { getCountryStoryPath } from '@/lib/storyblok/storyblok-paths';

type PreviewPageProps = DefaultLayoutProps<DefaultParams & { slug: string }> & {
	searchParams: Promise<Record<string, string | undefined>>;
};

export default async function PreviewCountryPage({ params, searchParams }: PreviewPageProps) {
	const { slug, lang, region } = await params;
	const resolvedSearchParams = await searchParams;

	return (
		<StoryblokPreviewCountryPage
			storyPath={getCountryStoryPath(slug)}
			lang={lang as WebsiteLanguage}
			region={region as WebsiteRegion}
			previewRoutePath={`/${lang}/${region}/countries/${slug}/preview`}
			searchParams={resolvedSearchParams}
		/>
	);
}

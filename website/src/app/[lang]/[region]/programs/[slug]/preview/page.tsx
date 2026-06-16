import { DefaultLayoutProps, DefaultParams } from '@/app/[lang]/[region]';
import { StoryblokPreviewProgramPage } from '@/components/storyblok/storyblok-preview-program-page';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { getProgramStoryPath } from '@/lib/storyblok/storyblok-paths';

type PreviewPageProps = DefaultLayoutProps<DefaultParams & { slug: string }> & {
	searchParams: Promise<Record<string, string | undefined>>;
};

export default async function PreviewProgramPage({ params, searchParams }: PreviewPageProps) {
	const { slug, lang, region } = await params;
	const resolvedSearchParams = await searchParams;

	return (
		<StoryblokPreviewProgramPage
			storyPath={getProgramStoryPath(slug)}
			lang={lang as WebsiteLanguage}
			region={region as WebsiteRegion}
			previewRoutePath={`/${lang}/${region}/programs/${slug}/preview`}
			searchParams={resolvedSearchParams}
		/>
	);
}

import { DefaultLayoutProps, DefaultParams } from '@/app/[lang]/[region]';
import { StoryblokPreviewProgramPage } from '@/components/storyblok/storyblok-preview-program-page';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { NEW_WEBSITE_SLUG } from '@/lib/utils/const';

type PreviewPageProps = DefaultLayoutProps<DefaultParams & { slug: string }> & {
	searchParams: Promise<Record<string, string | undefined>>;
};

export default async function PreviewProgramPage({ params, searchParams }: PreviewPageProps) {
	const { slug, lang, region } = await params;
	const resolvedSearchParams = await searchParams;

	return (
		<StoryblokPreviewProgramPage
			storyPath={`${NEW_WEBSITE_SLUG}/programs/${slug}`}
			lang={lang as WebsiteLanguage}
			previewRoutePath={`/${lang}/${region}/${NEW_WEBSITE_SLUG}/programs/${slug}/preview`}
			searchParams={resolvedSearchParams}
		/>
	);
}

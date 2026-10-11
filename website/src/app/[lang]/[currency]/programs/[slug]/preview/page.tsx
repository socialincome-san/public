import { DefaultLayoutProps, DefaultParams } from '@/app/[lang]/[currency]';
import { StoryblokPreviewProgramPage } from '@/components/storyblok/storyblok-preview-program-page';
import { getWebsiteBasePath, toWebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { getProgramStoryPath } from '@/lib/storyblok/storyblok-paths';

type PreviewPageProps = DefaultLayoutProps<DefaultParams & { slug: string }> & {
	searchParams: Promise<Record<string, string | undefined>>;
};

export default async function PreviewProgramPage({ params, searchParams }: PreviewPageProps) {
	const { slug, lang, currency } = await params;
	const resolvedSearchParams = await searchParams;

	return (
		<StoryblokPreviewProgramPage
			storyPath={getProgramStoryPath(slug)}
			lang={lang as WebsiteLanguage}
			currency={toWebsiteCurrency(currency)}
			previewRoutePath={`${getWebsiteBasePath(lang, toWebsiteCurrency(currency))}/programs/${slug}/preview`}
			searchParams={resolvedSearchParams}
		/>
	);
}

import { DefaultLayoutProps, DefaultParams } from '@/app/[lang]/[currency]';
import { StoryblokPreviewPage } from '@/components/storyblok/storyblok-preview-page';
import { getWebsiteBasePath, toWebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { getGetInvolvedPathTail, getPageStoryPath } from '@/lib/storyblok/storyblok-paths';

type PreviewPageProps = DefaultLayoutProps<DefaultParams & { folder: string; slug: string }> & {
	searchParams: Promise<Record<string, string | undefined>>;
};

export default async function PreviewGetInvolvedPage({ params, searchParams }: PreviewPageProps) {
	const { folder, slug, lang, currency } = await params;
	const pathTail = getGetInvolvedPathTail(folder, slug);

	return (
		<StoryblokPreviewPage
			storyPath={getPageStoryPath(pathTail)}
			lang={lang as WebsiteLanguage}
			currency={toWebsiteCurrency(currency)}
			previewRoutePath={`${getWebsiteBasePath(lang, toWebsiteCurrency(currency))}/${pathTail}/preview`}
			searchParams={await searchParams}
		/>
	);
}

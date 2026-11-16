import { DefaultLayoutProps, DefaultParams } from '@/app/[lang]/[currency]';
import { ContentPage, getContentPageMetadata } from '@/app/[lang]/[currency]/content-page';
import { getPublishedNestedSlugParams } from '@/app/[lang]/[currency]/published-slug-params';
import { StoryblokPreviewPage } from '@/components/storyblok/storyblok-preview-page';
import { getWebsiteBasePath, toWebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { getPageStoryPath, isContentPageStoryblokSlug } from '@/lib/storyblok/storyblok-paths';
import { notFound } from 'next/navigation';

type Props = DefaultLayoutProps<DefaultParams & { slug: string; path: string[] }> & {
	searchParams: Promise<Record<string, string>>;
};

const PREVIEW_SEGMENT = 'preview';

export const generateStaticParams = () => getPublishedNestedSlugParams();

export const generateMetadata = async ({ params }: Props) => {
	const { lang, slug, path } = await params;
	const pathTail = [slug, ...path].join('/');

	return getContentPageMetadata(getPageStoryPath(pathTail), lang as WebsiteLanguage, pathTail);
};

// The preview API redirects to "<page path>/preview", which this catch-all receives as its last segment
export default async function NestedContentPageRoute({ params, searchParams }: Props) {
	const { lang, currency, slug, path } = await params;
	const isPreview = path.at(-1) === PREVIEW_SEGMENT;
	const pathTail = [slug, ...(isPreview ? path.slice(0, -1) : path)].join('/');
	const storyPath = getPageStoryPath(pathTail);

	// Stories in folders like pages/persons render on their own routes, never as content pages
	if (!isContentPageStoryblokSlug(storyPath)) {
		return notFound();
	}

	if (isPreview) {
		return (
			<StoryblokPreviewPage
				storyPath={storyPath}
				lang={lang as WebsiteLanguage}
				currency={toWebsiteCurrency(currency)}
				previewRoutePath={`${getWebsiteBasePath(lang, toWebsiteCurrency(currency))}/${pathTail}/${PREVIEW_SEGMENT}`}
				searchParams={await searchParams}
			/>
		);
	}

	return <ContentPage storyPath={storyPath} lang={lang} currency={currency} searchParams={searchParams} />;
}

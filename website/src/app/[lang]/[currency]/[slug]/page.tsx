import { DefaultLayoutPropsWithSlug, DefaultPageProps } from '@/app/[lang]/[currency]';
import { ContentPage, getContentPageMetadata } from '@/app/[lang]/[currency]/content-page';
import { getPublishedSlugParams } from '@/app/[lang]/[currency]/published-slug-params';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { getPageStoryPath } from '@/lib/storyblok/storyblok-paths';

export const generateStaticParams = () => getPublishedSlugParams();

export const generateMetadata = async ({ params }: DefaultLayoutPropsWithSlug) => {
	const { lang, slug } = await params;

	return getContentPageMetadata(getPageStoryPath(slug), lang as WebsiteLanguage, slug);
};

export default async function ContentPageRoute({ params, searchParams }: DefaultLayoutPropsWithSlug & DefaultPageProps) {
	const { slug, lang, currency } = await params;

	return <ContentPage storyPath={getPageStoryPath(slug)} lang={lang} currency={currency} searchParams={searchParams} />;
}

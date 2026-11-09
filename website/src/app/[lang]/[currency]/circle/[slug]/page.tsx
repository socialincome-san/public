import { DefaultLayoutPropsWithSlug, DefaultPageProps } from '@/app/[lang]/[currency]';
import { ContentPage } from '@/app/[lang]/[currency]/content-page';
import { getPublishedSlugParams } from '@/app/[lang]/[currency]/published-slug-params';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { getCircleStoryPath, WEBSITE_CIRCLE_PATH_SEGMENT } from '@/lib/storyblok/storyblok-paths';
import { getWebsiteAlternates } from '@/lib/utils/metadata';
import { getTranslations } from 'next-intl/server';

export const generateStaticParams = () => getPublishedSlugParams(WEBSITE_CIRCLE_PATH_SEGMENT);

export const generateMetadata = async ({ params }: DefaultLayoutPropsWithSlug) => {
	const { lang, slug } = await params;

	return getWebsiteAlternates(lang as WebsiteLanguage, `${WEBSITE_CIRCLE_PATH_SEGMENT}/${slug}`);
};

export default async function CirclePage({ params, searchParams }: DefaultLayoutPropsWithSlug & DefaultPageProps) {
	const { slug, lang, currency } = await params;
	const t = await getTranslations('website-common');

	return (
		<ContentPage
			storyPath={getCircleStoryPath(slug)}
			lang={lang}
			currency={currency}
			searchParams={searchParams}
			folderBreadcrumb={{ label: t('circles.title') }}
		/>
	);
}

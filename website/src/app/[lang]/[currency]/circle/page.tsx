import { DefaultLayoutProps, DefaultPageProps } from '@/app/[lang]/[currency]';
import { ContentPage, getContentPageMetadata } from '@/app/[lang]/[currency]/content-page';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { getCirclesOverviewStoryPath, WEBSITE_CIRCLE_PATH_SEGMENT } from '@/lib/storyblok/storyblok-paths';
import { getTranslations } from 'next-intl/server';

export const generateMetadata = async ({ params }: DefaultLayoutProps) =>
	getContentPageMetadata(getCirclesOverviewStoryPath(), (await params).lang as WebsiteLanguage, WEBSITE_CIRCLE_PATH_SEGMENT);

export default async function CirclesOverviewRoute({ params, searchParams }: DefaultPageProps) {
	const { lang, currency } = await params;
	const t = await getTranslations('website-common');

	return (
		<ContentPage
			storyPath={getCirclesOverviewStoryPath()}
			lang={lang}
			currency={currency}
			searchParams={searchParams}
			folderBreadcrumb={{ label: t('circles.title'), isOverview: true }}
		/>
	);
}

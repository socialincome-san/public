import { DefaultLayoutProps, DefaultPageProps, DefaultParams } from '@/app/[lang]/[currency]';
import { ContentPage, getContentPageMetadata } from '@/app/[lang]/[currency]/content-page';
import { getPublishedFolderSlugParams } from '@/app/[lang]/[currency]/published-slug-params';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { getPageStoryPath } from '@/lib/storyblok/storyblok-paths';

type Props = DefaultLayoutProps<DefaultParams & { folder: string; slug: string }>;

export const generateStaticParams = () => getPublishedFolderSlugParams('get-involved');

export const generateMetadata = async ({ params }: Props) => {
	const { lang, folder, slug } = await params;
	const pathTail = `get-involved/${folder}/${slug}`;

	return getContentPageMetadata(getPageStoryPath(pathTail), lang as WebsiteLanguage, pathTail);
};

export default async function GetInvolvedPage({ params, searchParams }: Props & Pick<DefaultPageProps, 'searchParams'>) {
	const { folder, slug, lang, currency } = await params;

	return (
		<ContentPage
			storyPath={getPageStoryPath(`get-involved/${folder}/${slug}`)}
			lang={lang}
			currency={currency}
			searchParams={searchParams}
		/>
	);
}

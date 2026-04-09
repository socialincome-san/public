import { DefaultLayoutProps, DefaultParams } from '@/app/[lang]/[region]';
import { StoryblokPreviewLocalPartnerPage } from '@/components/storyblok/storyblok-preview-local-partner-page';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { NEW_WEBSITE_SLUG } from '@/lib/utils/const';

type PreviewPageProps = DefaultLayoutProps<DefaultParams & { slug: string }> & {
	searchParams: Promise<Record<string, string | undefined>>;
};

export default async function PreviewLocalPartnerPage({ params, searchParams }: PreviewPageProps) {
	const { slug, lang, region } = await params;
	const resolvedSearchParams = await searchParams;

	return (
		<StoryblokPreviewLocalPartnerPage
			storyPath={`${NEW_WEBSITE_SLUG}/local-partners/${slug}`}
			lang={lang as WebsiteLanguage}
			previewRoutePath={`/${lang}/${region}/${NEW_WEBSITE_SLUG}/local-partners/${slug}/preview`}
			searchParams={resolvedSearchParams}
		/>
	);
}

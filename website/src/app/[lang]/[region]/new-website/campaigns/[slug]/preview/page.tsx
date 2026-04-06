import { DefaultLayoutProps, DefaultParams } from '@/app/[lang]/[region]';
import { StoryblokPreviewCampaignPage } from '@/components/storyblok/storyblok-preview-campaign-page';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { NEW_WEBSITE_SLUG } from '@/lib/utils/const';

type PreviewPageProps = DefaultLayoutProps<DefaultParams & { slug: string }> & {
	searchParams: Promise<Record<string, string | undefined>>;
};

export default async function PreviewCampaignPage({ params, searchParams }: PreviewPageProps) {
	const { slug, lang, region } = await params;
	const resolvedSearchParams = await searchParams;

	return (
		<StoryblokPreviewCampaignPage
			storyPath={`${NEW_WEBSITE_SLUG}/campaigns/${slug}`}
			lang={lang as WebsiteLanguage}
			previewRoutePath={`/${lang}/${region}/${NEW_WEBSITE_SLUG}/campaigns/${slug}/preview`}
			searchParams={resolvedSearchParams}
		/>
	);
}

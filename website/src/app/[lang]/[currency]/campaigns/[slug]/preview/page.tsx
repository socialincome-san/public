import { type DefaultLayoutProps, type DefaultParams } from '@/app/[lang]/[currency]';
import { StoryblokPreviewCampaignPage } from '@/components/storyblok/storyblok-preview-campaign-page';
import { getWebsiteBasePath, toWebsiteCurrency, type WebsiteLanguage } from '@/lib/i18n/utils';
import { getCampaignStoryPath } from '@/lib/storyblok/storyblok-paths';

type PreviewPageProps = DefaultLayoutProps<DefaultParams & { slug: string }> & {
	searchParams: Promise<Record<string, string | undefined>>;
};

export default async function PreviewCampaignPage({ params, searchParams }: PreviewPageProps) {
	const { slug, lang, currency } = await params;
	const resolvedSearchParams = await searchParams;

	return (
		<StoryblokPreviewCampaignPage
			storyPath={getCampaignStoryPath(slug)}
			lang={lang as WebsiteLanguage}
			currency={toWebsiteCurrency(currency)}
			previewRoutePath={`${getWebsiteBasePath(lang, toWebsiteCurrency(currency))}/campaigns/${slug}/preview`}
			searchParams={resolvedSearchParams}
		/>
	);
}

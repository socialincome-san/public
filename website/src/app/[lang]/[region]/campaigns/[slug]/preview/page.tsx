import { type DefaultLayoutProps, type DefaultParams } from '@/app/[lang]/[region]';
import { StoryblokPreviewCampaignPage } from '@/components/storyblok/storyblok-preview-campaign-page';
import { type WebsiteLanguage, type WebsiteRegion } from '@/lib/i18n/utils';
import { getCampaignStoryPath } from '@/lib/storyblok/storyblok-paths';

type PreviewPageProps = DefaultLayoutProps<DefaultParams & { slug: string }> & {
	searchParams: Promise<Record<string, string | undefined>>;
};

export default async function PreviewCampaignPage({ params, searchParams }: PreviewPageProps) {
	const { slug, lang, region } = await params;
	const resolvedSearchParams = await searchParams;

	return (
		<StoryblokPreviewCampaignPage
			storyPath={getCampaignStoryPath(slug)}
			lang={lang as WebsiteLanguage}
			region={region as WebsiteRegion}
			previewRoutePath={`/${lang}/${region}/campaigns/${slug}/preview`}
			searchParams={resolvedSearchParams}
		/>
	);
}

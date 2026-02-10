import { DefaultPageProps } from '@/app/[lang]/[region]';
import { StoryblokPreviewPage } from '@/components/storyblok/storyblok-preview-page';
import { NEW_WEBSITE_SLUG } from '@/lib/utils/const';

type PreviewPageProps = DefaultPageProps & {
	searchParams: Promise<Record<string, string | undefined>>;
};

export default async function PreviewPage({ params, searchParams }: PreviewPageProps) {
	const { lang } = await params;
	const resolvedSearchParams = await searchParams;

	return <StoryblokPreviewPage storyPath={NEW_WEBSITE_SLUG} lang={lang} searchParams={resolvedSearchParams} />;
}

import { DefaultPageProps } from '@/app/[lang]/[region]';
import { StoryblokPreviewPage } from '@/components/storyblok/storyblok-preview-page';

type PreviewPageProps = DefaultPageProps & {
	searchParams: Promise<Record<string, string | undefined>>;
};

export default async function PreviewPage({ params, searchParams }: PreviewPageProps) {
	const { lang } = await params;
	const resolvedSearchParams = await searchParams;

	return <StoryblokPreviewPage storyPath="new-website" lang={lang} searchParams={resolvedSearchParams} />;
}

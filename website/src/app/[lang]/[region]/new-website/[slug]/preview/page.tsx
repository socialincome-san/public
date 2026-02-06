import { DefaultLayoutProps, DefaultParams } from '@/app/[lang]/[region]';
import { StoryblokPreviewPage } from '@/components/storyblok/storyblok-preview-page';

type PreviewPageProps = DefaultLayoutProps<DefaultParams & { slug: string }> & {
	searchParams: Promise<Record<string, string | undefined>>;
};

export default async function PreviewPage({ params, searchParams }: PreviewPageProps) {
	const { slug, lang } = await params;
	const resolvedSearchParams = await searchParams;

	return <StoryblokPreviewPage storyPath={`new-website/${slug}`} lang={lang} searchParams={resolvedSearchParams} />;
}

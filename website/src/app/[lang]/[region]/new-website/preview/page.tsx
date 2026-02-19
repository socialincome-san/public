import { DefaultPageProps } from '@/app/[lang]/[region]';
import { StoryblokPreviewPage } from '@/components/storyblok/storyblok-preview-page';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { NEW_WEBSITE_SLUG } from '@/lib/utils/const';

type PreviewPageProps = DefaultPageProps & {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function PreviewPage({ params, searchParams }: PreviewPageProps) {
  const { lang, region } = await params;
  const resolvedSearchParams = await searchParams;

  return (
    <StoryblokPreviewPage
      storyPath={NEW_WEBSITE_SLUG}
      lang={lang as WebsiteLanguage}
      region={region as WebsiteRegion}
      searchParams={resolvedSearchParams}
    />
  );
}

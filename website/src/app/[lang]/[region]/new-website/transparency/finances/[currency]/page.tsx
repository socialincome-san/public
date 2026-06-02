import { DefaultLayoutProps, DefaultParams } from '@/app/[lang]/[region]';
import PageContentType from '@/components/content-types/page';
import type { Page } from '@/generated/storyblok/types/109655/storyblok-components';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';

import { getPageStoryPath } from '@/lib/storyblok/storyblok-paths';
import type { ISbStoryData } from '@storyblok/js';
import { notFound } from 'next/navigation';

export const revalidate = 3600;
export const generateStaticParams = () => [{ currency: 'chf' }];

type TransparencyFinancesParams = DefaultParams & { currency: string };

export default async function Page({ params }: DefaultLayoutProps<TransparencyFinancesParams>) {
	const { lang, region } = await params;

	const storyPath = getPageStoryPath('transparency/finances');
	const storyResult = await services.storyblok.getStoryWithFallback<ISbStoryData<Page>>(storyPath, lang);
	if (!storyResult.success) {
		notFound();
	}

	return <PageContentType blok={storyResult.data.content} lang={lang as WebsiteLanguage} region={region as WebsiteRegion} />;
}

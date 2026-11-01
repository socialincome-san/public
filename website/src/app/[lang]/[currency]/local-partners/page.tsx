import { DefaultLayoutProps, DefaultPageProps } from '@/app/[lang]/[currency]';
import { getPageMetadata } from '@/app/[lang]/[currency]/page-metadata';
import { LocalPartnersOverviewPage } from '@/components/storyblok/local-partner/local-partners-overview-page';
import type { LocalPartnersOverview } from '@/generated/storyblok/types/109655/storyblok-components';
import { toWebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { getLocalPartnersOverviewStoryPath } from '@/lib/storyblok/storyblok-paths';
import { getTitleAndTextMetadata } from '@/lib/storyblok/storyblok-utils';
import { getStoryWithFallback } from '@/modules/storyblok-content/storyblok-content.cache';
import type { ISbStoryData } from '@storyblok/js';
import { notFound } from 'next/navigation';

export const generateMetadata = async ({ params }: DefaultLayoutProps) => {
	const lang = (await params).lang as WebsiteLanguage;
	const overviewResult = await getStoryWithFallback<ISbStoryData<LocalPartnersOverview>>(
		getLocalPartnersOverviewStoryPath(),
		lang,
	);

	return getPageMetadata(lang, 'local-partners', overviewResult.success ? getTitleAndTextMetadata(overviewResult.data) : {});
};

export default async function LocalPartnersOverviewRoute({ params, searchParams }: DefaultPageProps) {
	const { lang, currency } = await params;
	const overviewResult = await getStoryWithFallback<ISbStoryData<LocalPartnersOverview>>(
		getLocalPartnersOverviewStoryPath(),
		lang,
	);

	if (!overviewResult.success) {
		return notFound();
	}

	return (
		<LocalPartnersOverviewPage
			overview={overviewResult.data}
			lang={lang as WebsiteLanguage}
			currency={toWebsiteCurrency(currency)}
			searchParams={searchParams}
		/>
	);
}

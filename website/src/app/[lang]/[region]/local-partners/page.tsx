import { DefaultPageProps } from '@/app/[lang]/[region]';
import { LocalPartnersOverviewPage } from '@/components/storyblok/local-partner/local-partners-overview-page';
import type { LocalPartnersOverview } from '@/generated/storyblok/types/109655/storyblok-components';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { getLocalPartnersOverviewStoryPath } from '@/lib/storyblok/storyblok-paths';
import { getStoryWithFallback } from '@/modules/storyblok-content/storyblok-content.cache';
import type { ISbStoryData } from '@storyblok/js';
import { notFound } from 'next/navigation';

export default async function LocalPartnersOverviewRoute({ params, searchParams }: DefaultPageProps) {
	const { lang, region } = await params;
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
			region={region as WebsiteRegion}
			searchParams={searchParams}
		/>
	);
}

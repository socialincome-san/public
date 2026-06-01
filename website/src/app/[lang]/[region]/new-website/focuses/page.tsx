import { DefaultPageProps } from '@/app/[lang]/[region]';
import { FocusesOverviewPage } from '@/components/storyblok/focus/focuses-overview-page';
import type { FocusOverview } from '@/generated/storyblok/types/109655/storyblok-components';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import { getFocusesOverviewStoryPath } from '@/lib/storyblok/storyblok-paths';
import type { ISbStoryData } from '@storyblok/js';
import { notFound } from 'next/navigation';

export const revalidate = 900;

export default async function FocusesOverviewRoute({ params }: DefaultPageProps) {
	const { lang, region } = await params;
	const overviewResult = await services.storyblok.getStoryWithFallback<ISbStoryData<FocusOverview>>(
		getFocusesOverviewStoryPath(),
		lang,
	);

	if (!overviewResult.success) {
		return notFound();
	}

	return (
		<FocusesOverviewPage overview={overviewResult.data} lang={lang as WebsiteLanguage} region={region as WebsiteRegion} />
	);
}

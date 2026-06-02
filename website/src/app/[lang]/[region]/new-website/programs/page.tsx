import { DefaultPageProps } from '@/app/[lang]/[region]';
import { ProgramsOverviewPage } from '@/components/storyblok/program/programs-overview-page';
import type { ProgramOverview } from '@/generated/storyblok/types/109655/storyblok-components';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import { getProgramsOverviewStoryPath } from '@/lib/storyblok/storyblok-paths';
import type { ISbStoryData } from '@storyblok/js';
import { notFound } from 'next/navigation';

export const revalidate = 900;

export default async function ProgramsOverviewRoute({ params, searchParams }: DefaultPageProps) {
	const { lang, region } = await params;
	const resolvedSearchParams = await searchParams;
	const overviewResult = await services.storyblok.getStoryWithFallback<ISbStoryData<ProgramOverview>>(
		getProgramsOverviewStoryPath(),
		lang,
	);

	if (!overviewResult.success) {
		return notFound();
	}

	return (
		<ProgramsOverviewPage
			overview={overviewResult.data}
			lang={lang as WebsiteLanguage}
			region={region as WebsiteRegion}
			searchParams={resolvedSearchParams}
		/>
	);
}

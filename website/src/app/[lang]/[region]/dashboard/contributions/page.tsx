import { AppLoadingSkeleton } from '@/components/skeletons/app-loading-skeleton';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { Suspense } from 'react';
import { DefaultPageProps } from '../..';
import { ContributionsTable } from './contributions-table';

export default async function Page({ params, searchParams }: DefaultPageProps) {
	const { lang, region } = await params;

	return (
		<Suspense fallback={<AppLoadingSkeleton />}>
			<ContributionsTable lang={lang as WebsiteLanguage} region={region as WebsiteRegion} searchParams={searchParams} />
		</Suspense>
	);
}

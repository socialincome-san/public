import { AppLoadingSkeleton } from '@/components/skeletons/app-loading-skeleton';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { Suspense } from 'react';
import { DefaultPageProps } from '../..';
import { ContributionsTable } from './contributions-table';

export default async function Page({ params, searchParams }: DefaultPageProps) {
	const { lang } = await params;

	return (
		<Suspense fallback={<AppLoadingSkeleton />}>
			<ContributionsTable lang={lang as WebsiteLanguage} searchParams={searchParams} />
		</Suspense>
	);
}

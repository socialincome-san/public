import { AppLoadingSkeleton } from '@/components/skeletons/app-loading-skeleton';
import { Suspense } from 'react';
import { DefaultPageProps } from '../..';
import { ContributionsTable } from './contributions-table';

export default function Page({ searchParams }: DefaultPageProps) {
	return (
		<Suspense fallback={<AppLoadingSkeleton />}>
			<ContributionsTable searchParams={searchParams} />
		</Suspense>
	);
}

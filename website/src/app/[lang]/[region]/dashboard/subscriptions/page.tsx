import { AppLoadingSkeleton } from '@/components/skeletons/app-loading-skeleton';
import { Suspense } from 'react';
import { DefaultPageProps } from '../..';
import { SubscriptionsTable } from './subscriptions-table';

export default function Page({ searchParams }: DefaultPageProps) {
	return (
		<Suspense fallback={<AppLoadingSkeleton />}>
			<SubscriptionsTable searchParams={searchParams} />
		</Suspense>
	);
}

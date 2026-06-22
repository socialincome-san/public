import { AppLoadingSkeleton } from '@/components/skeletons/app-loading-skeleton';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { Suspense } from 'react';
import { DefaultPageProps } from '../..';
import { SubscriptionsTable } from './subscriptions-table';

export default async function Page({ params, searchParams }: DefaultPageProps) {
	const { lang, region } = await params;

	return (
		<Suspense fallback={<AppLoadingSkeleton />}>
			<SubscriptionsTable lang={lang as WebsiteLanguage} region={region as WebsiteRegion} searchParams={searchParams} />
		</Suspense>
	);
}

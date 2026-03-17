import { AppLoadingSkeleton } from '@/components/skeletons/app-loading-skeleton';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { Suspense } from 'react';
import { DefaultPageProps } from '../..';
import { SubscriptionsTable } from './subscriptions-table';

export default async function Page({ params, searchParams }: DefaultPageProps) {
	const { lang } = await params;

	return (
		<Suspense fallback={<AppLoadingSkeleton />}>
			<SubscriptionsTable lang={lang as WebsiteLanguage} searchParams={searchParams} />
		</Suspense>
	);
}

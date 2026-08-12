import { AppLoadingSkeleton } from '@/components/skeletons/app-loading-skeleton';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { Suspense } from 'react';
import { type DefaultPageProps } from '../..';
import { SubscriptionsView } from './subscriptions-view';

export default async function Page({ params }: DefaultPageProps) {
	const { lang, region } = await params;

	return (
		<Suspense fallback={<AppLoadingSkeleton />}>
			<SubscriptionsView lang={lang as WebsiteLanguage} region={region as WebsiteRegion} />
		</Suspense>
	);
}

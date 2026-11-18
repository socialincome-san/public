import { defaultLanguage, isWebsiteLanguage, toWebsiteCurrency } from '@/lib/i18n/utils';
import { AppLoadingSkeleton } from '@socialincome/design-system/feedback/app-loading-skeleton/app-loading-skeleton';
import { Suspense } from 'react';
import { type DefaultPageProps } from '../..';
import { OwnCampaigns } from './own-campaigns';

export default async function Page({ params }: DefaultPageProps) {
	const { lang, currency } = await params;

	return (
		<Suspense fallback={<AppLoadingSkeleton />}>
			<OwnCampaigns lang={isWebsiteLanguage(lang) ? lang : defaultLanguage} currency={toWebsiteCurrency(currency)} />
		</Suspense>
	);
}

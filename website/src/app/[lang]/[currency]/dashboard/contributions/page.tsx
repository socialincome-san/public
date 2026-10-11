import { toWebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { AppLoadingSkeleton } from '@socialincome/design-system/feedback/app-loading-skeleton/app-loading-skeleton';
import { Suspense } from 'react';
import { DefaultPageProps } from '../..';
import { ContributionsTable } from './contributions-table';

export default async function Page({ params, searchParams }: DefaultPageProps) {
	const { lang, currency } = await params;

	return (
		<Suspense fallback={<AppLoadingSkeleton />}>
			<ContributionsTable
				lang={lang as WebsiteLanguage}
				currency={toWebsiteCurrency(currency)}
				searchParams={searchParams}
			/>
		</Suspense>
	);
}

import { AppLoadingSkeleton } from '@socialincome/design-system/feedback/app-loading-skeleton/app-loading-skeleton';
import { Suspense } from 'react';
import { DefaultPageProps } from '../..';
import YourDonationCertificates from './your-donation-certificates';

export default function Page({ searchParams }: DefaultPageProps) {
	return (
		<Suspense fallback={<AppLoadingSkeleton />}>
			<YourDonationCertificates searchParams={searchParams} />
		</Suspense>
	);
}

import { AppLoadingSkeleton } from '@/components/skeletons/app-loading-skeleton';
import { Suspense } from 'react';
import { DefaultPageProps } from '../..';
import YourDonationCertificates from './your-donation-certificates';

export default async function Page({ params, searchParams }: DefaultPageProps) {
	return (
		<Suspense fallback={<AppLoadingSkeleton />}>
			<YourDonationCertificates region={(await params).region} lang={(await params).lang} searchParams={searchParams} />
		</Suspense>
	);
}

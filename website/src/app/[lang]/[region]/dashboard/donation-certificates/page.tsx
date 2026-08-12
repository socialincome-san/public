import { AppLoadingSkeleton } from '@/components/skeletons/app-loading-skeleton';
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

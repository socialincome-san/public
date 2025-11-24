import { Suspense } from 'react';
import { DefaultPageProps } from '../..';
import YourDonationCertificates from './your-donation-certificates';

export default async function Page({ params }: DefaultPageProps) {
	return (
		<Suspense fallback={<div>Loading donation certificates…</div>}>
			<YourDonationCertificates region={(await params).region} lang={(await params).lang} />
		</Suspense>
	);
}

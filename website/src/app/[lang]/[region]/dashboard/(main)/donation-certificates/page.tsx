import { SpinnerIcon } from '@socialincome/ui';
import { Suspense } from 'react';
import { DefaultPageProps } from '../../..';
import YourDonationCertificates from './your-donation-certificates';

export default async function Page({ params }: DefaultPageProps) {
  return (
    <Suspense fallback={<SpinnerIcon />}>
      <YourDonationCertificates region={(await params).region} lang={(await params).lang} />
    </Suspense>
  );
}

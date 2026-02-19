import { WebsiteLanguage } from '@/lib/i18n/utils';
import { SpinnerIcon } from '@socialincome/ui';
import { Suspense } from 'react';
import { DefaultPageProps } from '../../..';
import { SubscriptionsTable } from './subscriptions-table';

export default async function Page({ params }: DefaultPageProps) {
  const { lang } = await params;

  return (
    <Suspense fallback={<SpinnerIcon />}>
      <SubscriptionsTable lang={lang as WebsiteLanguage} />
    </Suspense>
  );
}

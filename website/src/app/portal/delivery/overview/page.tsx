import { PayoutProcessOverviewClient } from '@/app/portal/delivery/overview/payout-process-overview-client';
import { getPayoutProcessOverviewOptions } from '@/modules/mobile-money-providers/mobile-money-provider.service';
import { requireSession } from '@/server/session';
import { AppLoadingSkeleton } from '@socialincome/design-system/feedback/app-loading-skeleton/app-loading-skeleton';
import { Suspense } from 'react';

export default function PayoutProcessOverviewPage() {
	return (
		<Suspense fallback={<AppLoadingSkeleton />}>
			<PayoutProcessOverviewDataLoader />
		</Suspense>
	);
}

const PayoutProcessOverviewDataLoader = async () => {
	await requireSession('user');

	const result = await getPayoutProcessOverviewOptions();

	return (
		<PayoutProcessOverviewClient options={result.success ? result.data : []} error={result.success ? null : result.error} />
	);
};

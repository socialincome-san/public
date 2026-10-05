import { PayoutProcessOverviewClient } from '@/app/portal/delivery/overview/payout-process-overview-client';
import { AppLoadingSkeleton } from '@/components/skeletons/app-loading-skeleton';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { getPayoutProcessOverviewOptions } from '@/modules/mobile-money-providers/mobile-money-provider.service';
import { Suspense } from 'react';

export default function PayoutProcessOverviewPage() {
	return (
		<Suspense fallback={<AppLoadingSkeleton />}>
			<PayoutProcessOverviewDataLoader />
		</Suspense>
	);
}

const PayoutProcessOverviewDataLoader = async () => {
	await getAuthenticatedUserOrRedirect();

	const result = await getPayoutProcessOverviewOptions();

	return (
		<PayoutProcessOverviewClient options={result.success ? result.data : []} error={result.success ? null : result.error} />
	);
};

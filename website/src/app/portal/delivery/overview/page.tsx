import { PayoutProcessOverviewClient } from '@/app/portal/delivery/overview/payout-process-overview-client';
import { AppLoadingSkeleton } from '@/components/skeletons/app-loading-skeleton';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { services } from '@/lib/services/services';
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

	const result = await services.read.mobileMoneyProvider.getPayoutProcessOverviewOptions();

	return (
		<PayoutProcessOverviewClient options={result.success ? result.data : []} error={result.success ? null : result.error} />
	);
};

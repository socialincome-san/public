import { makeOngoingPayoutColumns } from '@/components/data-table/columns/ongoing-payouts';
import DataTable from '@/components/data-table/data-table';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { services } from '@/lib/services/services';
import { Suspense } from 'react';

export default function OngoingPayoutsPage() {
	return (
		<Suspense>
			<OngoingPayoutsDataLoader />
		</Suspense>
	);
}

const OngoingPayoutsDataLoader = async () => {
	const user = await getAuthenticatedUserOrRedirect();

	const service = services.payout;
	const result = await service.getOngoingPayoutTableView(user.id);

	const error = result.success ? null : result.error;
	const rows = result.success ? result.data.tableRows : [];

	return (
		<DataTable
			title="Ongoing Payouts"
			error={error}
			emptyMessage="No ongoing payouts found"
			data={rows}
			makeColumns={makeOngoingPayoutColumns}
		/>
	);
};

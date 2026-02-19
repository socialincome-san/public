import { makePayoutConfirmationColumns } from '@/components/data-table/columns/payout-confirmation';
import DataTable from '@/components/data-table/data-table';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { PayoutService } from '@/lib/services/payout/payout.service';
import { Suspense } from 'react';

export default function ConfirmPayoutsPage() {
	return (
		<Suspense>
			<ConfirmPayoutsDataLoader />
		</Suspense>
	);
}

const ConfirmPayoutsDataLoader = async () => {
	const user = await getAuthenticatedUserOrRedirect();

	const service = new PayoutService();
	const result = await service.getPayoutConfirmationTableView(user.id);

	const error = result.success ? null : result.error;
	const rows = result.success ? result.data.tableRows : [];

	return (
		<DataTable
			title="Payout confirmations"
			error={error}
			emptyMessage="No payouts waiting for confirmation"
			data={rows}
			makeColumns={makePayoutConfirmationColumns}
			initialSorting={[{ id: 'paymentAt', desc: false }]}
			searchKeys={['recipientFirstName', 'recipientLastName', 'programName', 'phoneNumber']}
		/>
	);
};

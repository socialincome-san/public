import { makeOngoingPayoutsColumns } from '@/app/portal/components/data-table/columns/ongoing-payouts';
import DataTable from '@/app/portal/components/data-table/data-table';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { PayoutService } from '@socialincome/shared/src/database/services/payout/payout.service';

export default async function OngoingPayoutsPage() {
	const user = await getAuthenticatedUserOrRedirect();

	const service = new PayoutService();
	const result = await service.getOngoingPayoutTableView(user.id);

	const error = result.success ? null : result.error;
	const rows = result.success ? result.data.tableRows : [];

	return (
		<DataTable
			title="Ongoing Payouts"
			error={error}
			emptyMessage="No ongoing payouts found"
			data={rows}
			makeColumns={makeOngoingPayoutsColumns}
		/>
	);
}

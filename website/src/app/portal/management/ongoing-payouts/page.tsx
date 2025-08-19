import TableWrapper from '@/app/portal/components/custom/data-table/elements/table-wrapper';
import PayoutsTable from '@/app/portal/components/custom/data-table/payouts/payouts-table';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { PayoutService } from '@socialincome/shared/src/database/services/payout/payout.service';

export default async function OngoingPayoutsPage() {
	const user = await getAuthenticatedUserOrRedirect();

	const service = new PayoutService();
	const result = await service.getPayoutTableViewForUser(user.id);

	const error = result.success ? null : result.error;
	const rows = result.success ? result.data.tableRows : [];

	return (
		<TableWrapper
			title="Ongoing Payouts (3 months)"
			error={error}
			isEmpty={!rows.length}
			emptyMessage="No ongoing payouts found"
		>
			<PayoutsTable data={rows} />
		</TableWrapper>
	);
}

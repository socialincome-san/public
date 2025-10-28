import { PayoutsTableClient } from '@/app/portal/(routes)/(protected)/delivery/make-payouts/payouts-table-client';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { PayoutService } from '@socialincome/shared/src/database/services/payout/payout.service';
import type { PayoutTableViewRow } from '@socialincome/shared/src/database/services/payout/payout.types';

export default async function PayoutsPage() {
	const user = await getAuthenticatedUserOrRedirect();

	const payoutService = new PayoutService();
	const result = await payoutService.getTableView(user.id);

	const error = result.success ? null : result.error;
	const rows: PayoutTableViewRow[] = result.success ? result.data.tableRows : [];

	return <PayoutsTableClient rows={rows} error={error} />;
}

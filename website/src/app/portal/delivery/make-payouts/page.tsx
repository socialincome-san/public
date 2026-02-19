import { PayoutsTableClient } from '@/app/portal/delivery/make-payouts/payouts-table-client';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { PayoutService } from '@/lib/services/payout/payout.service';
import type { PayoutTableViewRow } from '@/lib/services/payout/payout.types';
import { Suspense } from 'react';

export default function PayoutsPage() {
  return (
    <Suspense>
      <PayoutsDataLoader />
    </Suspense>
  );
}

const PayoutsDataLoader = async () => {
  const user = await getAuthenticatedUserOrRedirect();

  const payoutService = new PayoutService();
  const result = await payoutService.getTableView(user.id);

  const error = result.success ? null : result.error;
  const rows: PayoutTableViewRow[] = result.success ? result.data.tableRows : [];

  return <PayoutsTableClient rows={rows} error={error} />;
};

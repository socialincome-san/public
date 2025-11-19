import { makePayoutForecastColumns } from '@/components/data-table/columns/payout-forecast';
import DataTable from '@/components/data-table/data-table';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { PayoutService } from '@socialincome/shared/src/database/services/payout/payout.service';

type Props = { params: Promise<{ programId: string }> };
const MONTHS_AHEAD = 6;

export default async function FinancesPageProgramScoped({ params }: Props) {
	const { programId } = await params;
	const user = await getAuthenticatedUserOrRedirect();

	const payoutService = new PayoutService();

	const result = await payoutService.getForecastTableView(user.id, programId, MONTHS_AHEAD);

	const error = result.success ? null : result.error;
	const rows = result.success ? result.data.tableRows : [];

	return (
		<DataTable
			title="Payout Forecast"
			error={error}
			emptyMessage="No payout forecast found"
			data={rows}
			makeColumns={makePayoutForecastColumns}
		/>
	);
}

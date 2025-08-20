import TableWrapper from '@/app/portal/components/custom/data-table/elements/table-wrapper';
import PayoutForecastTable from '@/app/portal/components/custom/data-table/payout-forecast/payout-forecast-table';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { PayoutForecastService } from '@socialincome/shared/src/database/services/payout-forecast/payout-forecast.service';

type Props = { params: Promise<{ programId: string }> };
const MONTHS_AHEAD = 6;

export default async function FinancesPage({ params }: Props) {
	const { programId } = await params;
	const user = await getAuthenticatedUserOrRedirect();

	const service = new PayoutForecastService();
	const result = await service.getPayoutForecastTableView(programId, user.id, MONTHS_AHEAD);

	const error = result.success ? null : result.error;
	const rows = result.success ? result.data.tableRows : [];

	return (
		<TableWrapper
			title="Payout Forecast"
			error={error}
			isEmpty={!rows.length}
			emptyMessage="No payout forecast data found"
		>
			<PayoutForecastTable data={rows} />
		</TableWrapper>
	);
}

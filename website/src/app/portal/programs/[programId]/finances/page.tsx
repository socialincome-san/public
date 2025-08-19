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
	const result = await service.getPayoutForecast(programId, user.id, MONTHS_AHEAD);

	const error = result.success ? null : result.error;
	const data = result.success ? result.data : [];

	return (
		<TableWrapper error={error} isEmpty={!data.length} emptyMessage="No payout forecast data found">
			<div className="mb-4 flex items-center justify-between">
				<h1 className="text-xl font-semibold">Payout forecast</h1>
			</div>

			<PayoutForecastTable data={data} />
		</TableWrapper>
	);
}

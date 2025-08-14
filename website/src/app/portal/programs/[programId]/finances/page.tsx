import { DataTable } from '@/app/portal/components/custom/data-table/data-table';
import { payoutForecastColumns } from '@/app/portal/components/custom/data-table/payout-forecast-columns';
import { PayoutForecastService } from '@socialincome/shared/src/database/services/payout-forecast/payout-forecast.service';

type Props = { params: Promise<{ programId: string }> };

export default async function FinancesPage({ params }: Props) {
	const { programId } = await params;

	const service = new PayoutForecastService();
	const result = await service.getPayoutForecast(programId);

	if (!result.success) return <div className="p-4">Error loading payout forecast: {result.error}</div>;
	if (!result.data.length) return <div className="p-4">No payout forecast data found</div>;

	return <DataTable columns={payoutForecastColumns} data={result.data} />;
}

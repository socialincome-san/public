import { Card } from '@/components/card';
import { makePayoutForecastColumns } from '@/components/data-table/columns/payout-forecast';
import DataTable from '@/components/data-table/data-table';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { services } from '@/lib/services/services';
import { Suspense } from 'react';

type Props = { params: Promise<{ programId: string }> };
const MONTHS_AHEAD = 6;

export default function FinancesPageProgramScoped({ params }: Props) {
	return (
		<Card>
			<Suspense>
				<FinancesProgramScopedDataLoader params={params} />
			</Suspense>
		</Card>
	);
}

const FinancesProgramScopedDataLoader = async ({ params }: { params: Promise<{ programId: string }> }) => {
	const { programId } = await params;
	const user = await getAuthenticatedUserOrRedirect();

	const result = await services.payout.getForecastTableView(user.id, programId, MONTHS_AHEAD);

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
};

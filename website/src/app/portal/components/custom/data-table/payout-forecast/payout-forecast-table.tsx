'use client';

import { DataTable } from '@/app/portal/components/custom/data-table/data-table';
import { makePayoutForecastColumns } from '@/app/portal/components/custom/data-table/payout-forecast/payout-forecast-columns';
import type { PayoutForecastRow } from '@socialincome/shared/src/database/services/payout-forecast/payout-forecast.types';

export default function PayoutForecastTable({ data }: { data: PayoutForecastRow[] }) {
	const columns = makePayoutForecastColumns();
	return <DataTable data={data} columns={columns} />;
}

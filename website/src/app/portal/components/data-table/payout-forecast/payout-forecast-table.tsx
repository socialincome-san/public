'use client';

import { DataTable } from '@/app/portal/components/data-table/data-table';
import { makePayoutForecastColumns } from '@/app/portal/components/data-table/payout-forecast/payout-forecast-columns';
import type { PayoutForecastTableViewRow } from '@socialincome/shared/src/database/services/payout-forecast/payout-forecast.types';

type PayoutForecastTableProps = {
	data: PayoutForecastTableViewRow[];
};

export default function PayoutForecastTable({ data }: PayoutForecastTableProps) {
	const columns = makePayoutForecastColumns();
	return <DataTable data={data} columns={columns} />;
}

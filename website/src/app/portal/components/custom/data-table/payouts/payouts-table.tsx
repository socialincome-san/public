'use client';

import { DataTable } from '@/app/portal/components/custom/data-table/data-table';
import { makePayoutsColumns } from '@/app/portal/components/custom/data-table/payouts/payouts-columns';
import { PayoutTableViewRow } from '@socialincome/shared/src/database/services/payout/payout.types';

export type PayoutsTableProps = {
	data: PayoutTableViewRow[];
};

export default function PayoutsTable({ data }: PayoutsTableProps) {
	const columns = makePayoutsColumns();
	return <DataTable data={data} columns={columns} />;
}

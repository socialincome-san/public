'use client';

import { makeContributionsColumns } from '@/app/portal/components/custom/data-table/contributions/contributions-columns';
import { DataTable } from '@/app/portal/components/custom/data-table/data-table';
import { ContributionTableViewRow } from '@socialincome/shared/src/database/services/contribution/contribution.types';

type ContributionsTableProps = {
	data: ContributionTableViewRow[];
};

export default function ContributionsTable({ data }: ContributionsTableProps) {
	const columns = makeContributionsColumns();
	return <DataTable data={data} columns={columns} />;
}

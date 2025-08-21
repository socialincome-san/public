'use client';

import { makeContributorColumns } from '@/app/portal/components/data-table/contributors/contributors-columns';
import { DataTable } from '@/app/portal/components/data-table/data-table';
import { ContributorTableViewRow } from '@socialincome/shared/src/database/services/contributor/contributor.types';

type ContributorsTableProps = {
	data: ContributorTableViewRow[];
};

export default function ContributorsTable({ data }: ContributorsTableProps) {
	const columns = makeContributorColumns();
	return <DataTable data={data} columns={columns} />;
}

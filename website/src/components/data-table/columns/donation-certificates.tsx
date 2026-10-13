'use client';

import { DateCell } from '@/components/data-table/elements/date-cell';
import { SortableHeader } from '@/components/data-table/elements/sortable-header';
import { TextCell } from '@/components/data-table/elements/text-cell';
import type { ColumnDef } from '@/components/data-table/tanstack-table';
import type { DonationCertificateTableViewRow } from '@/modules/donation-certificates/donation-certificate.types';

const contributorColumns: ColumnDef<DonationCertificateTableViewRow>[] = [
	{
		id: 'contributor',
		accessorFn: (row) => `${row.contributorFirstName} ${row.contributorLastName}`.trim(),
		header: (ctx) => <SortableHeader ctx={ctx}>Contributor</SortableHeader>,
		cell: (ctx) => <TextCell ctx={ctx} />,
	},
	{
		accessorKey: 'email',
		header: (ctx) => <SortableHeader ctx={ctx}>Email</SortableHeader>,
		cell: (ctx) => <TextCell ctx={ctx} />,
	},
];

export const makeDonationCertificateColumns = ({
	hideContributor = false,
}: { hideContributor?: boolean } = {}): ColumnDef<DonationCertificateTableViewRow>[] => {
	return [
		{
			accessorKey: 'year',
			header: (ctx) => <SortableHeader ctx={ctx}>Year</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		...(hideContributor ? [] : contributorColumns),
		{
			accessorKey: 'storagePath',
			header: (ctx) => <SortableHeader ctx={ctx}>Storage Path</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'createdAt',
			header: (ctx) => <SortableHeader ctx={ctx}>Created</SortableHeader>,
			cell: (ctx) => <DateCell ctx={ctx} />,
		},
	];
};

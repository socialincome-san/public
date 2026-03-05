'use client';

import { DateCell } from '@/components/data-table/elements/date-cell';
import { SortableHeader } from '@/components/data-table/elements/sortable-header';
import { TextCell } from '@/components/data-table/elements/text-cell';
import type { DonationCertificateTableViewRow } from '@/lib/services/donation-certificate/donation-certificate.types';
import type { ColumnDef } from '@tanstack/react-table';

export const makeDonationCertificateColumns = (): ColumnDef<DonationCertificateTableViewRow>[] => {
	return [
		{
			accessorKey: 'year',
			header: (ctx) => <SortableHeader ctx={ctx}>Year</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
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

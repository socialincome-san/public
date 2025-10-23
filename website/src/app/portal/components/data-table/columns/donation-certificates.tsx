'use client';

import { ActionCell } from '@/app/portal/components/data-table/elements/action-cell';
import { SortableHeader } from '@/app/portal/components/data-table/elements/sortable-header';
import { TextCell } from '@/app/portal/components/data-table/elements/text-cell';
import type { DonationCertificateTableViewRow } from '@socialincome/shared/src/database/services/donation-certificate/donation-certificate.types';
import type { ColumnDef } from '@tanstack/react-table';

export function makeDonationCertificateColumns(): ColumnDef<DonationCertificateTableViewRow>[] {
	return [
		{
			accessorKey: 'year',
			header: (ctx) => <SortableHeader ctx={ctx}>Year</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'contributorFirstName',
			header: (ctx) => <SortableHeader ctx={ctx}>First Name</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'contributorLastName',
			header: (ctx) => <SortableHeader ctx={ctx}>Last Name</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'email',
			header: (ctx) => <SortableHeader ctx={ctx}>Email</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'programName',
			header: (ctx) => <SortableHeader ctx={ctx}>Program</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'storagePath',
			header: (ctx) => <SortableHeader ctx={ctx}>Storage Path</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'createdAtFormatted',
			header: (ctx) => <SortableHeader ctx={ctx}>Created</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			id: 'actions',
			header: '',
			enableSorting: false,
			cell: (ctx) => <ActionCell ctx={ctx} />,
		},
	];
}

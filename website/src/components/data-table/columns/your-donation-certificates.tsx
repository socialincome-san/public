'use client';

import { DateCell } from '@/components/data-table/elements/date-cell';
import { SortableHeader } from '@/components/data-table/elements/sortable-header';
import { TextCell } from '@/components/data-table/elements/text-cell';
import { YourDonationCertificateTableViewRow } from '@/lib/services/donation-certificate/donation-certificate.types';
import type { ColumnDef } from '@tanstack/react-table';
import { DownloadCell } from '../elements/download-cell';

export function makeYourCertificatesColumns(): ColumnDef<YourDonationCertificateTableViewRow>[] {
	return [
		{
			accessorKey: 'createdAt',
			header: (ctx) => <SortableHeader ctx={ctx}>Created</SortableHeader>,
			cell: (ctx) => <DateCell ctx={ctx} />,
		},
		{
			accessorKey: 'year',
			header: (ctx) => <SortableHeader ctx={ctx}>Year</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'language',
			header: (ctx) => <SortableHeader ctx={ctx}>Language</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'storagePath',
			header: (ctx) => <SortableHeader ctx={ctx}>Download</SortableHeader>,
			cell: (ctx) => <DownloadCell ctx={ctx} />,
		},
	];
}

'use client';

import { DateCell } from '@/components/data-table/elements/date-cell';
import { SortableHeader } from '@/components/data-table/elements/sortable-header';
import { TextCell } from '@/components/data-table/elements/text-cell';
import type { ColumnDef } from '@/components/data-table/tanstack-table';
import { Translator } from '@/lib/i18n/translator';
import type { YourDonationCertificateTableViewRow } from '@/modules/donation-certificates/donation-certificate.types';
import { DownloadCell } from '../elements/download-cell';

export const makeYourCertificatesColumns = (
	_hideProgramName = false,
	_hideLocalPartner = false,
	translator?: Translator,
): ColumnDef<YourDonationCertificateTableViewRow>[] => {
	void _hideProgramName;
	void _hideLocalPartner;

	return [
		{
			accessorKey: 'createdAt',
			header: (ctx) => <SortableHeader ctx={ctx}>{translator?.t('donation-certificates.created')}</SortableHeader>,
			cell: (ctx) => <DateCell ctx={ctx} />,
		},
		{
			accessorKey: 'year',
			header: (ctx) => <SortableHeader ctx={ctx}>{translator?.t('donation-certificates.year')}</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'language',
			header: (ctx) => <SortableHeader ctx={ctx}>{translator?.t('donation-certificates.language')}</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'storagePath',
			header: '',
			cell: (ctx) => <DownloadCell ctx={ctx} />,
		},
	];
};

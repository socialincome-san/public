'use client';

import { DateCell } from '@/components/data-table/elements/date-cell';
import { SortableHeader } from '@/components/data-table/elements/sortable-header';
import { TextCell } from '@/components/data-table/elements/text-cell';
import { Translator } from '@/lib/i18n/translator';
import { YourDonationCertificateTableViewRow } from '@/lib/services/donation-certificate/donation-certificate.types';
import type { ColumnDef } from '@tanstack/react-table';
import { DownloadCell } from '../elements/download-cell';

export const makeYourCertificatesColumns = (
  hideProgramName = false,
  hideLocalPartner = false,
  translator?: Translator,
): ColumnDef<YourDonationCertificateTableViewRow>[] => {
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

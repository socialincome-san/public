'use client';

import { TableCell, TableRow } from '@/components/table';
import type { ProgramCountryFeasibilityRow } from '@/lib/services/country/country.types';
import Link from 'next/link';

type Props = {
  row: ProgramCountryFeasibilityRow;
  bgClass: string;
};

export const ExpansionRow = ({ row, bgClass }: Props) => {
  const renderSource = (source: ProgramCountryFeasibilityRow['cash']['details']['source'] | undefined) => {
    if (!source) {
      return null;
    }

    if (source.href) {
      return (
        <Link
          href={source.href}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-muted-foreground transition hover:text-foreground"
        >
          {source.text}
          <span aria-hidden>↗</span>
        </Link>
      );
    }

    return <p className="text-muted-foreground">{source.text}</p>;
  };

  const renderDetails = (details: ProgramCountryFeasibilityRow['cash']['details']) => {
    return (
      <div className="space-y-1 text-sm">
        <p>{details.text}</p>
        {renderSource(details.source)}
      </div>
    );
  };

  return (
    <TableRow className={bgClass}>
      <TableCell />
      <TableCell />
      <TableCell className="p-4 align-top">{renderDetails(row.cash.details)}</TableCell>
      <TableCell className="p-4 align-top">{renderDetails(row.mobileMoney.details)}</TableCell>
      <TableCell className="p-4 align-top">{renderDetails(row.mobileNetwork.details)}</TableCell>
      <TableCell className="p-4 align-top">{renderDetails(row.sanctions.details)}</TableCell>
      <TableCell />
    </TableRow>
  );
};

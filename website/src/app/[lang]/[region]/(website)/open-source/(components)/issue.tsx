'use client';

import { buttonVariants } from '@/components/button';
import { TableCell, TableRow } from '@socialincome/ui';
import { cn } from '@socialincome/ui/src/lib/utils';
import Link from 'next/link';

interface Issue {
  id: number;
  title: string;
  url: string;
  labels: string[];
}

interface IssueProps extends Pick<Issue, 'title' | 'url'> {
  text: string;
}

export const Issue = ({ title, url, text }: IssueProps) => {
  return (
    <TableRow className="p-5 hover:bg-transparent">
      <TableCell className="text-xl">{title}</TableCell>
      <TableCell className="text-right text-xl">
        <Link
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ variant: 'link', size: 'default' }), 'hover:underline')}
        >
          {text}
        </Link>
      </TableCell>
    </TableRow>
  );
};

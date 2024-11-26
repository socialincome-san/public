'use client';

import { TableCell, TableRow } from '@socialincome/ui';
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

export function Issue({ title, url, text }: IssueProps) {
	return (
		<TableRow className="border-foreground p-5">
			<TableCell className="text-xl">{title}</TableCell>
			<TableCell className="text-xl">
				<Link href={url} target="_blank" rel="noopener noreferrer">
					{text}
				</Link>
			</TableCell>
		</TableRow>
	);
}

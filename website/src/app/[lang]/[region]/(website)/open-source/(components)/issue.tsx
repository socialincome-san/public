'use client';

import { Button, TableCell, TableRow } from '@socialincome/ui';

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
		<TableRow className="p-5 hover:bg-transparent">
			<TableCell className="text-xl">{title}</TableCell>
			<TableCell className="text-right text-xl">
				<Button asChild variant="link" className="hover:underline">
					<a href={url} target="_blank" rel="noopener noreferrer">
						{text}
					</a>
				</Button>
			</TableCell>
		</TableRow>
	);
}

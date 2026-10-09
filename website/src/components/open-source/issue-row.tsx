import type { GithubIssue } from '@/modules/github/github.types';
import { Button } from '@socialincome/design-system/actions/button/button';
import Link from 'next/link';

type Props = Pick<GithubIssue, 'title' | 'url'> & {
	issueLinkLabel: string;
};

export const IssueRow = ({ title, url, issueLinkLabel }: Props) => {
	return (
		<div className="grid grid-cols-1 gap-2 px-4 py-4 text-sm md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-12 md:py-3">
			<p className="font-medium">{title}</p>
			<div className="md:justify-self-end">
				<Button variant="link" asChild>
					<Link href={url} target="_blank" rel="noopener noreferrer">
						{issueLinkLabel}
					</Link>
				</Button>
			</div>
		</div>
	);
};

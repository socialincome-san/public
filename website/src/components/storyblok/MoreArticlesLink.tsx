import { linkCn, Typography } from '@socialincome/ui';
import Link from 'next/link';

type MoreArticlesLinkProps = {
	text: string;
	url: string;
};

export function MoreArticlesLink({ text, url }: MoreArticlesLinkProps) {
	return (
		<Typography size="sm">
			<Link
				className={`${linkCn({ arrow: 'external', underline: 'none' })} ml-1`}
				href={url}
				key={'link_to_default'}
				rel="noopener noreferrer"
			>
				{text}
			</Link>
		</Typography>
	);
}

import { createLinkForArticle } from '@/components/storyblok/StoryblokUtils';
import { linkCn, Typography } from '@socialincome/ui';
import Link from 'next/link';

type OriginalLanguageLinkProps = {
	originalLanguage?: string;
	slug: string;
	lang: string;
	region: string;
	text: string;
	languageName: string;
};

export function OriginalLanguageLink({
	originalLanguage,
	slug,
	lang,
	region,
	text,
	languageName,
}: OriginalLanguageLinkProps) {
	return (
		originalLanguage &&
		originalLanguage !== lang && (
			<Typography>
				{text}
				<Link
					className={`${linkCn({ arrow: 'external', underline: 'none' })} ml-1`}
					href={createLinkForArticle(slug, originalLanguage, region)}
					key={'link_original_language'}
					rel="noopener noreferrer"
				>
					{languageName}
				</Link>
			</Typography>
		)
	);
}

import { createWebsiteJournalArticleLink } from '@/lib/services/storyblok/storyblok.utils';
import { linkCn } from '@socialincome/ui';
import Link from 'next/link';

type Props = {
	originalLanguage?: string;
	slug: string;
	lang: string;
	region: string;
	text: string;
	languageName: string;
};

export const OriginalLanguageLink = ({ originalLanguage, slug, lang, region, text, languageName }: Props) => {
	if (!originalLanguage || originalLanguage === lang) {
		return null;
	}

	return (
		<p className="text-muted-foreground text-sm">
			{text}
			<Link
				className={linkCn({ arrow: 'external', underline: 'none' })}
				href={createWebsiteJournalArticleLink(slug, originalLanguage, region)}
				rel="noopener noreferrer"
			>
				{languageName}
			</Link>
		</p>
	);
};

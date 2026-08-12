import { getWebsiteRootParams } from '@/lib/i18n/website-root-params';
import { createWebsiteJournalArticleLink } from '@/lib/services/storyblok/storyblok.utils';
import { cn } from '@/lib/utils/cn';
import Link from 'next/link';

type Props = {
	originalLanguage?: string;
	slug: string;
	text: string;
	languageName: string;
};

export const OriginalLanguageLink = async ({ originalLanguage, slug, text, languageName }: Props) => {
	const { lang, region } = await getWebsiteRootParams();
	if (!originalLanguage || originalLanguage === lang) {
		return null;
	}

	return (
		<p className="text-muted-foreground text-sm">
			{text}
			<Link
				className={cn('text-primary font-medium underline-offset-4 hover:underline')}
				href={createWebsiteJournalArticleLink(slug, originalLanguage, region)}
				rel="noopener noreferrer"
			>
				{languageName}
			</Link>
		</p>
	);
};

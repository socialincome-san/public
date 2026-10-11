import type { WebsiteCurrency } from '@/lib/i18n/utils';
import { createWebsiteJournalArticleLink } from '@/lib/storyblok/storyblok-utils';
import { cn } from '@socialincome/design-system/cn';
import Link from 'next/link';

type Props = {
	originalLanguage?: string;
	slug: string;
	lang: string;
	currency: WebsiteCurrency;
	text: string;
	languageName: string;
};

export const OriginalLanguageLink = ({ originalLanguage, slug, lang, currency, text, languageName }: Props) => {
	if (!originalLanguage || originalLanguage === lang) {
		return null;
	}

	return (
		<p className="text-muted-foreground text-sm">
			{text}
			<Link
				className={cn('text-primary font-medium underline-offset-4 hover:underline')}
				href={createWebsiteJournalArticleLink(slug, originalLanguage, currency)}
				rel="noopener noreferrer"
			>
				{languageName}
			</Link>
		</p>
	);
};

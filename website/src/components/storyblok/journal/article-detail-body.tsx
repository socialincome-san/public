import { DonationForm } from '@/components/donation-wizard/donation-form';
import { ArticleAuthorLinks } from '@/components/storyblok/journal/article-authors';
import { ArticleRichText } from '@/components/storyblok/journal/article-rich-text';
import { OriginalLanguageLink } from '@/components/storyblok/journal/original-language-link';
import { TagBadge } from '@/components/storyblok/journal/tag-badge';
import type { WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { getArticleAuthors } from '@/lib/storyblok/storyblok-utils';
import type { JournalArticle } from '@/modules/journal/journal.types';
import type { ISbStoryData } from '@storyblok/js';
import { getTranslations } from 'next-intl/server';
import type { StoryblokRichtext } from 'storyblok-rich-text-react-renderer';

type Props = {
	story: ISbStoryData<JournalArticle>;
	slug: string;
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
};

export const ArticleDetailBody = async ({ story, slug, lang, currency }: Props) => {
	const [t, tCommon] = await Promise.all([getTranslations('website-journal'), getTranslations('common')]);
	const article = story.content;

	return (
		<>
			<OriginalLanguageLink
				originalLanguage={article.originalLanguage}
				slug={slug}
				lang={lang}
				currency={currency}
				text={t('article.from-original-language')}
				languageName={article.originalLanguage ? tCommon(`language-name.${article.originalLanguage}`) : ''}
			/>

			<div className="prose text-foreground prose-a:text-primary max-w-none [&_a]:[font-size:inherit]! [&_a]:[font-weight:inherit]! [&_a]:[color:inherit]!">
				<ArticleRichText document={article.content as StoryblokRichtext} lang={lang} donationForm={<DonationForm />} />
			</div>

			{article.footnotes && (
				<div className="text-muted-foreground">
					<ArticleRichText
						document={article.footnotes as StoryblokRichtext}
						lang={lang}
						donationForm={<DonationForm />}
						variant="footnotes"
					/>
				</div>
			)}

			{article.tags && article.tags.length > 0 && (
				<div className="flex flex-wrap gap-2">
					{article.tags.map((tag) => (
						<TagBadge key={tag.slug} tag={tag} lang={lang} currency={currency} />
					))}
				</div>
			)}

			<ArticleAuthorLinks authors={getArticleAuthors(article)} lang={lang} currency={currency} />
		</>
	);
};

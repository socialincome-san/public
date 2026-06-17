import { ArticleRichText } from '@/components/storyblok/journal/article-rich-text';
import { AuthorAvatar } from '@/components/storyblok/journal/author-avatar';
import { OriginalLanguageLink } from '@/components/storyblok/journal/original-language-link';
import { TagBadge } from '@/components/storyblok/journal/tag-badge';
import type { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { createWebsitePersonLink, getPersonDisplayName, ResolvedArticle } from '@/lib/services/storyblok/storyblok.utils';
import type { ISbStoryData } from '@storyblok/js';
import Link from 'next/link';
import type { StoryblokRichtext } from 'storyblok-rich-text-react-renderer';

type Props = {
	story: ISbStoryData<ResolvedArticle>;
	slug: string;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
	translator: Translator;
};

export const ArticleDetailBody = ({ story, slug, lang, region, translator }: Props) => {
	const article = story.content;
	const author = article.author;

	return (
		<>
			<OriginalLanguageLink
				originalLanguage={article.originalLanguage}
				slug={slug}
				lang={lang}
				region={region}
				text={translator.t('article.from-original-language')}
				languageName={translator.t('language-name.' + article.originalLanguage)}
			/>

			<div className="prose prose-neutral text-foreground prose-headings:font-semibold prose-a:text-primary max-w-none">
				<ArticleRichText document={article.content as StoryblokRichtext} lang={lang} />
			</div>

			{article.footnotes && (
				<div className="prose prose-neutral text-muted-foreground max-w-none text-sm">
					<ArticleRichText document={article.footnotes as StoryblokRichtext} lang={lang} />
				</div>
			)}

			{article.tags && article.tags.length > 0 && (
				<div className="flex flex-wrap gap-2">
					{article.tags.map((tag) => (
						<TagBadge key={tag.slug} tag={tag} lang={lang} region={region} />
					))}
				</div>
			)}

			<Link
				href={createWebsitePersonLink(author.slug, lang, region)}
				className="flex w-fit items-center gap-3 transition-opacity hover:opacity-80"
			>
				<AuthorAvatar author={author} size="lg" />
				<span className="text-lg font-medium">{getPersonDisplayName(author)}</span>
			</Link>
		</>
	);
};

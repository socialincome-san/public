import { DonationFormServer } from '@/components/donation-wizard/donation-form-server';
import { ArticleRichText } from '@/components/storyblok/journal/article-rich-text';
import { AuthorAvatar } from '@/components/storyblok/journal/author-avatar';
import { OriginalLanguageLink } from '@/components/storyblok/journal/original-language-link';
import { TagBadge } from '@/components/storyblok/journal/tag-badge';
import type { Translator } from '@/lib/i18n/translator';
import { getWebsiteRootParams } from '@/lib/i18n/website-root-params';
import { createWebsitePersonLink, getPersonDisplayName, ResolvedArticle } from '@/lib/services/storyblok/storyblok.utils';
import type { ISbStoryData } from '@storyblok/js';
import Link from 'next/link';
import type { StoryblokRichtext } from 'storyblok-rich-text-react-renderer';

type Props = {
	story: ISbStoryData<ResolvedArticle>;
	slug: string;
	translator: Translator;
};

export const ArticleDetailBody = async ({ story, slug, translator }: Props) => {
	const { lang, region } = await getWebsiteRootParams();
	const article = story.content;
	const author = article.author;

	return (
		<>
			<OriginalLanguageLink
				originalLanguage={article.originalLanguage}
				slug={slug}
				text={translator.t('article.from-original-language')}
				languageName={translator.t('language-name.' + article.originalLanguage)}
			/>

			<div className="prose prose-neutral text-foreground prose-a:text-primary max-w-none [&_a]:[font-size:inherit]! [&_a]:[font-weight:inherit]! [&_a]:[color:inherit]!">
				<ArticleRichText
					document={article.content as StoryblokRichtext}
					lang={lang}
					donationForm={<DonationFormServer lang={lang} />}
				/>
			</div>

			{article.footnotes && (
				<div className="text-muted-foreground">
					<ArticleRichText
						document={article.footnotes as StoryblokRichtext}
						lang={lang}
						donationForm={<DonationFormServer lang={lang} />}
						variant="footnotes"
					/>
				</div>
			)}

			{article.tags && article.tags.length > 0 && (
				<div className="flex flex-wrap gap-2">
					{article.tags.map((tag) => (
						<TagBadge key={tag.slug} tag={tag} />
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

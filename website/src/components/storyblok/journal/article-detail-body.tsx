import { AfricaMapBlock } from '@/components/content-blocks/africa-map';
import { DonationForm } from '@/components/donation-wizard/donation-form';
import { ArticleRichText } from '@/components/storyblok/journal/article-rich-text';
import { OriginalLanguageLink } from '@/components/storyblok/journal/original-language-link';
import { TagBadge } from '@/components/storyblok/journal/tag-badge';
import type { AfricaMap } from '@/generated/storyblok/types/109655/storyblok-components';
import type { WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { getRichTextBloks } from '@/lib/storyblok/storyblok-richtext';
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

const isAfricaMap = (blok: unknown): blok is AfricaMap =>
	typeof blok === 'object' &&
	blok !== null &&
	'component' in blok &&
	blok.component === 'africaMap' &&
	'_uid' in blok &&
	typeof blok._uid === 'string';

export const ArticleDetailBody = async ({ story, slug, lang, currency }: Props) => {
	const [t, tCommon] = await Promise.all([getTranslations('website-journal'), getTranslations('common')]);
	const article = story.content;
	// The rich text renders on the client, but a map loads its country pages on the server
	const africaMaps = Object.fromEntries(
		getRichTextBloks(article.content)
			.filter(isAfricaMap)
			.map((blok) => [
				blok._uid,
				<AfricaMapBlock key={blok._uid} blok={blok} lang={lang} currency={currency} placement="article" />,
			]),
	);

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
				<ArticleRichText
					document={article.content as StoryblokRichtext}
					lang={lang}
					donationForm={<DonationForm />}
					africaMaps={africaMaps}
				/>
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
		</>
	);
};

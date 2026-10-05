import type { Article } from '@/generated/storyblok/types/109655/storyblok-components';
import type { ISbStoryData } from '@storyblok/js';

const DEFAULT_FEED_BASE_URL = 'https://socialincome.org/en/int';

export type JournalRssArticle = Pick<
	ISbStoryData<Article>,
	'slug' | 'first_published_at' | 'published_at' | 'created_at'
> & {
	content: Pick<Article, 'title' | 'leadText' | 'author'>;
};

const escapeXml = (value: string) =>
	value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

const getPublicationDate = (article: JournalRssArticle) =>
	article.first_published_at ?? article.published_at ?? article.created_at;

const getPublicationTimestamp = (article: JournalRssArticle) => {
	const timestamp = Date.parse(getPublicationDate(article));

	return Number.isNaN(timestamp) ? 0 : timestamp;
};

const getAuthorName = (author: Article['author']) => {
	if (!author || typeof author === 'string' || !('content' in author)) {
		return 'Social Income';
	}

	const content = (author as { content?: unknown }).content;
	if (!content || typeof content !== 'object') {
		return 'Social Income';
	}

	const fields = content as { fullName?: unknown; firstName?: unknown; lastName?: unknown; name?: unknown };
	const fullName = typeof fields.fullName === 'string' ? fields.fullName.trim() : '';
	if (fullName) {
		return fullName;
	}

	const firstName = typeof fields.firstName === 'string' ? fields.firstName.trim() : '';
	const lastName = typeof fields.lastName === 'string' ? fields.lastName.trim() : '';
	const name = `${firstName} ${lastName}`.trim();

	return name || (typeof fields.name === 'string' && fields.name.trim()) || 'Social Income';
};

const formatRssDate = (value: string) => {
	const timestamp = Date.parse(value);

	return Number.isNaN(timestamp) ? undefined : new Date(timestamp).toUTCString();
};

const articleUrl = (baseUrl: string, slug: string) => `${baseUrl.replace(/\/+$/, '')}/journal/${encodeURIComponent(slug)}`;

export const buildJournalRssFeed = (articles: JournalRssArticle[], baseUrl = DEFAULT_FEED_BASE_URL): string => {
	const sortedArticles = [...articles].sort((left, right) => getPublicationTimestamp(right) - getPublicationTimestamp(left));
	const items = sortedArticles
		.map((article) => {
			const link = articleUrl(baseUrl, article.slug);
			const publicationDate = formatRssDate(getPublicationDate(article));

			return [
				'<item>',
				`<title>${escapeXml(article.content.title)}</title>`,
				`<link>${escapeXml(link)}</link>`,
				`<guid isPermaLink="true">${escapeXml(link)}</guid>`,
				...(publicationDate ? [`<pubDate>${publicationDate}</pubDate>`] : []),
				`<dc:creator>${escapeXml(getAuthorName(article.content.author))}</dc:creator>`,
				`<description>${escapeXml(article.content.leadText?.trim() ?? '')}</description>`,
				'</item>',
			].join('');
		})
		.join('');

	const latestDate = sortedArticles.map(getPublicationDate).map(formatRssDate).find(Boolean);

	return [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/">',
		'<channel>',
		'<title>Social Income Journal</title>',
		`<link>${escapeXml(`${baseUrl.replace(/\/+$/, '')}/journal`)}</link>`,
		'<description>Articles, research, and project updates from Social Income.</description>',
		'<language>en</language>',
		...(latestDate ? [`<lastBuildDate>${latestDate}</lastBuildDate>`] : []),
		items,
		'</channel>',
		'</rss>',
	].join('');
};

import type { Article } from '@/generated/storyblok/types/109655/storyblok-components';

export type JournalRssArticle = {
	slug: string;
	first_published_at?: string | null;
	published_at?: string | null;
	created_at: string;
	content: Pick<Article, 'title' | 'leadText' | 'author'>;
};

const DEFAULT_FEED_LANGUAGE = 'en';
const DEFAULT_FEED_BASE_URL = `https://socialincome.org/${DEFAULT_FEED_LANGUAGE}`;

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

const isValidXml10CodePoint = (codePoint: number) =>
	codePoint === 0x9 ||
	codePoint === 0xa ||
	codePoint === 0xd ||
	(codePoint >= 0x20 && codePoint <= 0xd7ff) ||
	(codePoint >= 0xe000 && codePoint <= 0xfffd) ||
	(codePoint >= 0x10000 && codePoint <= 0x10ffff);

const sanitizeXmlText = (value: string) =>
	[...value].filter((character) => isValidXml10CodePoint(character.codePointAt(0) ?? 0)).join('');

const escapeXml = (value: string) =>
	sanitizeXmlText(value)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');

const getPublicationDate = (article: JournalRssArticle) =>
	article.first_published_at ?? article.published_at ?? article.created_at;

const getPublishedUpdateDate = (article: JournalRssArticle) =>
	article.published_at ?? article.first_published_at ?? article.created_at;

const getPublicationTimestamp = (article: JournalRssArticle) => {
	const timestamp = Date.parse(getPublicationDate(article));

	return Number.isNaN(timestamp) ? 0 : timestamp;
};

const getAuthorName = (author: Article['author']) => {
	if (!author || typeof author === 'string' || !isRecord(author) || !isRecord(author.content)) {
		return 'Social Income';
	}

	const fullName = typeof author.content.fullName === 'string' ? author.content.fullName.trim() : '';
	if (fullName) {
		return fullName;
	}

	const firstName = typeof author.content.firstName === 'string' ? author.content.firstName.trim() : '';
	const lastName = typeof author.content.lastName === 'string' ? author.content.lastName.trim() : '';
	const name = `${firstName} ${lastName}`.trim();

	return name || (typeof author.content.name === 'string' && author.content.name.trim()) || 'Social Income';
};

const formatRssDate = (value: string | null | undefined) => {
	if (!value) {
		return undefined;
	}

	const timestamp = Date.parse(value);

	return Number.isNaN(timestamp) ? undefined : new Date(timestamp).toUTCString();
};

const articleUrl = (baseUrl: string, slug: string) => `${baseUrl.replace(/\/+$/, '')}/journal/${encodeURIComponent(slug)}`;

export const buildJournalRssFeed = (
	articles: JournalRssArticle[],
	baseUrl = DEFAULT_FEED_BASE_URL,
	language = DEFAULT_FEED_LANGUAGE,
): string => {
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

	const latestPublishedUpdate = sortedArticles
		.map(getPublishedUpdateDate)
		.filter((value): value is string => Boolean(value) && !Number.isNaN(Date.parse(value)))
		.sort((left, right) => Date.parse(right) - Date.parse(left))[0];
	const latestDate = formatRssDate(latestPublishedUpdate);

	return [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/">',
		'<channel>',
		'<title>Social Income Journal</title>',
		`<link>${escapeXml(`${baseUrl.replace(/\/+$/, '')}/journal`)}</link>`,
		'<description>Articles, research, and project updates from Social Income.</description>',
		`<language>${escapeXml(language)}</language>`,
		...(latestDate ? [`<lastBuildDate>${latestDate}</lastBuildDate>`] : []),
		items,
		'</channel>',
		'</rss>',
	].join('');
};

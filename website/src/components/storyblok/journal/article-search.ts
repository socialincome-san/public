import {
	getArticleAuthors,
	getArticleTitle,
	getArticleTypeLabel,
	getPersonDisplayName,
} from '@/lib/storyblok/storyblok-utils';
import type { JournalArticle } from '@/modules/journal/journal.types';
import type { ISbStoryData } from '@storyblok/js';

// Lower case, without accents and with plain apostrophes, so "senegal" finds "Sénégal" and "they're" finds "they’re"
const normalize = (value: string) =>
	value
		.normalize('NFD')
		.replace(/\p{Diacritic}/gu, '')
		.replace(/[\u2018\u2019\u02BC]/g, "'")
		.toLowerCase();

/** Everything a visitor can search an article by: title, lead text, authors, tags and article type. */
export const getArticleSearchText = (article: ISbStoryData<JournalArticle>) =>
	normalize(
		[
			getArticleTitle(article),
			article.content.leadText,
			...getArticleAuthors(article.content).map(getPersonDisplayName),
			...(article.content.tags ?? []).map((tag) => tag.content?.value),
			getArticleTypeLabel(article.content.type),
		]
			.filter(Boolean)
			.join(' '),
	);

/** Every word of the query has to occur in the text; an empty query matches everything. */
export const matchesArticleSearch = (searchText: string, query: string) =>
	normalize(query)
		.split(/\s+/)
		.filter(Boolean)
		.every((word) => searchText.includes(word));

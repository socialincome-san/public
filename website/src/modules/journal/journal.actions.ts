'use server';

import { resultFail } from '@/lib/service-result';
import {
	journalArticleRequestSchema,
	journalArticlesByUuidsRequestSchema,
	journalLanguageRequestSchema,
	journalPageRequestSchema,
} from './journal.schemas';
import {
	getJournalArticle,
	getJournalArticlePageData,
	getJournalArticlesByUuids,
	getJournalPerson,
	getJournalPersonPageData,
	getLatestJournalArticles,
} from './journal.service';

export const getJournalArticlePageDataAction = async (input: unknown) => {
	const parsed = journalPageRequestSchema.safeParse(input);

	return parsed.success ? getJournalArticlePageData(parsed.data) : resultFail('Invalid journal article request');
};

export const getJournalPersonPageDataAction = async (input: unknown) => {
	const parsed = journalPageRequestSchema.safeParse(input);

	return parsed.success ? getJournalPersonPageData(parsed.data) : resultFail('Invalid journal person request');
};

export const getJournalArticleAction = async (input: unknown) => {
	const parsed = journalArticleRequestSchema.safeParse(input);

	return parsed.success
		? getJournalArticle(parsed.data.language, parsed.data.slug)
		: resultFail('Invalid journal article request');
};

export const getJournalPersonAction = async (input: unknown) => {
	const parsed = journalArticleRequestSchema.safeParse(input);

	return parsed.success
		? getJournalPerson(parsed.data.language, parsed.data.slug)
		: resultFail('Invalid journal person request');
};

export const getLatestJournalArticlesAction = async (input: unknown) => {
	const parsed = journalLanguageRequestSchema.safeParse(input);

	return parsed.success ? getLatestJournalArticles(parsed.data) : resultFail('Invalid journal language');
};

export const getJournalArticlesByUuidsAction = async (input: unknown) => {
	const parsed = journalArticlesByUuidsRequestSchema.safeParse(input);

	return parsed.success
		? getJournalArticlesByUuids(parsed.data.language, parsed.data.articleUuids)
		: resultFail('Invalid journal articles request');
};

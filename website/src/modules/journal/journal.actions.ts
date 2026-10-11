'use server';

import type { Person } from '@/generated/storyblok/types/109655/storyblok-components';
import { resultFail, type Result } from '@/lib/result';
import type { JournalArticlePageData, JournalPersonPageData } from '@/modules/journal/journal.types';
import type { ResolvedArticle } from '@/modules/storyblok-content/storyblok-content.types';
import type { ISbStoryData } from '@storyblok/js';
import {
	getJournalArticle,
	getJournalArticlePageData,
	getJournalArticlesByUuids,
	getJournalPerson,
	getJournalPersonPageData,
	getLatestJournalArticles,
} from './journal.cache';
import {
	journalArticleRequestSchema,
	journalArticlesByUuidsRequestSchema,
	journalLanguageRequestSchema,
	journalPageRequestSchema,
} from './journal.schemas';

export const getJournalArticlePageDataAction = async (input: unknown): Promise<Result<JournalArticlePageData>> => {
	const parsed = journalPageRequestSchema.safeParse(input);

	return parsed.success ? getJournalArticlePageData(parsed.data) : resultFail('Invalid journal article request');
};

export const getJournalPersonPageDataAction = async (input: unknown): Promise<Result<JournalPersonPageData>> => {
	const parsed = journalPageRequestSchema.safeParse(input);

	return parsed.success ? getJournalPersonPageData(parsed.data) : resultFail('Invalid journal person request');
};

export const getJournalArticleAction = async (input: unknown): Promise<Result<ISbStoryData<ResolvedArticle>>> => {
	const parsed = journalArticleRequestSchema.safeParse(input);

	return parsed.success
		? getJournalArticle(parsed.data.language, parsed.data.slug)
		: resultFail('Invalid journal article request');
};

export const getJournalPersonAction = async (input: unknown): Promise<Result<ISbStoryData<Person>>> => {
	const parsed = journalArticleRequestSchema.safeParse(input);

	return parsed.success
		? getJournalPerson(parsed.data.language, parsed.data.slug)
		: resultFail('Invalid journal person request');
};

export const getLatestJournalArticlesAction = async (input: unknown): Promise<Result<ISbStoryData<ResolvedArticle>[]>> => {
	const parsed = journalLanguageRequestSchema.safeParse(input);

	return parsed.success ? getLatestJournalArticles(parsed.data) : resultFail('Invalid journal language');
};

export const getJournalArticlesByUuidsAction = async (input: unknown): Promise<Result<ISbStoryData<ResolvedArticle>[]>> => {
	const parsed = journalArticlesByUuidsRequestSchema.safeParse(input);

	return parsed.success
		? getJournalArticlesByUuids(parsed.data.language, parsed.data.articleUuids)
		: resultFail('Invalid journal articles request');
};

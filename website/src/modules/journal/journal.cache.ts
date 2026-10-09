import type { Result } from '@/lib/result';
import { cacheResult } from '@/lib/result-cache';
import type { JournalRssArticle } from '@/lib/storyblok/journal-rss';
import type { ISbStoryData } from '@storyblok/js';
import { cacheTag } from 'next/cache';
import * as service from './journal.service';
import {
	JOURNAL_CACHE_TAG,
	type JournalArticle,
	type JournalArticlePageData,
	type JournalOverviewPageData,
	type JournalOverviewRequest,
	type JournalPageRequest,
	type JournalPerson,
	type JournalPersonPageData,
} from './journal.types';

export const getJournalOverviewPageData = async (
	request: JournalOverviewRequest,
): Promise<Result<JournalOverviewPageData>> => {
	'use cache';
	cacheTag(JOURNAL_CACHE_TAG);

	return cacheResult(service.getJournalOverviewPageData(request));
};

export const getJournalArticlePageData = async (request: JournalPageRequest): Promise<Result<JournalArticlePageData>> => {
	'use cache';
	cacheTag(JOURNAL_CACHE_TAG);

	return cacheResult(service.getJournalArticlePageData(request));
};

export const getJournalPersonPageData = async (request: JournalPageRequest): Promise<Result<JournalPersonPageData>> => {
	'use cache';
	cacheTag(JOURNAL_CACHE_TAG);

	return cacheResult(service.getJournalPersonPageData(request));
};

export const getJournalArticle = async (language: string, slug: string): Promise<Result<ISbStoryData<JournalArticle>>> => {
	'use cache';
	cacheTag(JOURNAL_CACHE_TAG);

	return cacheResult(service.getJournalArticle(language, slug));
};

export const getJournalPerson = async (language: string, slug: string): Promise<Result<ISbStoryData<JournalPerson>>> => {
	'use cache';
	cacheTag(JOURNAL_CACHE_TAG);

	return cacheResult(service.getJournalPerson(language, slug));
};

export const getLatestJournalArticles = async (language: string): Promise<Result<ISbStoryData<JournalArticle>[]>> => {
	'use cache';
	cacheTag(JOURNAL_CACHE_TAG);

	return cacheResult(service.getLatestJournalArticles(language));
};

export const getPublishedJournalArticles = async (language: string): Promise<Result<JournalRssArticle[]>> => {
	'use cache';
	cacheTag(JOURNAL_CACHE_TAG);

	return cacheResult(service.getPublishedJournalArticles(language));
};

export const getJournalArticlesByUuids = async (
	language: string,
	articleUuids: string[],
): Promise<Result<ISbStoryData<JournalArticle>[]>> => {
	'use cache';
	cacheTag(JOURNAL_CACHE_TAG);

	return cacheResult(service.getJournalArticlesByUuids(language, articleUuids));
};

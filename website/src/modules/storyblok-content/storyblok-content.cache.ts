import type {
	Article,
	ArticleType,
	Campaign,
	CommunityGlobals,
	Country,
	Focus,
	LocalPartner,
	Person,
	Program,
	Tag,
} from '@/generated/storyblok/types/109655/storyblok-components';
import type { Result } from '@/lib/result';
import { cacheResult } from '@/lib/result-cache';
import type { ISbStoryData } from '@storyblok/js';
import { cacheTag } from 'next/cache';
import * as service from './storyblok-content.service';
import {
	STORYBLOK_CACHE_TAG,
	type ResolvedArticle,
	type StoryblokPublishedLink,
	type StoryTitleData,
} from './storyblok-content.types';

const withStoryblokCache = <T>(pending: Promise<Result<T>>): Promise<Result<T>> => {
	cacheTag(STORYBLOK_CACHE_TAG);

	return cacheResult(pending);
};

export const getStoryWithFallback = async <T>(slug: string, language: string): Promise<Result<T>> => {
	'use cache';

	return withStoryblokCache(service.getStoryWithFallback<T>(slug, language));
};

export const getStoryTitle = async (slug: string, language: string): Promise<Result<StoryTitleData>> => {
	'use cache';

	return withStoryblokCache(service.getStoryTitle(slug, language));
};

export const getOverviewArticlesCountForDefaultLang = async (): Promise<Result<number>> => {
	'use cache';

	return withStoryblokCache(service.getOverviewArticlesCountForDefaultLang());
};

export const getArticleCountByTagForDefaultLang = async (tagId: string): Promise<Result<number>> => {
	'use cache';

	return withStoryblokCache(service.getArticleCountByTagForDefaultLang(tagId));
};

export const getArticleCountByArticleTypeForDefaultLang = async (articleTypeId: string): Promise<Result<number>> => {
	'use cache';

	return withStoryblokCache(service.getArticleCountByArticleTypeForDefaultLang(articleTypeId));
};

export const getArticleCountByAuthorForDefaultLang = async (authorId: string): Promise<Result<number>> => {
	'use cache';

	return withStoryblokCache(service.getArticleCountByAuthorForDefaultLang(authorId));
};

export const getPersonsByUuids = async (
	language: string,
	personUuids: string[],
): Promise<Result<ISbStoryData<Person>[]>> => {
	'use cache';

	return withStoryblokCache(service.getPersonsByUuids(language, personUuids));
};

export const getOverviewAuthors = async (language: string): Promise<Result<ISbStoryData<Person>[]>> => {
	'use cache';

	return withStoryblokCache(service.getOverviewAuthors(language));
};

export const getPersonsByCountryOffice = async (
	language: string,
	isoCodes: string[],
): Promise<Result<ISbStoryData<Person>[]>> => {
	'use cache';

	return withStoryblokCache(service.getPersonsByCountryOffice(language, isoCodes));
};

export const getPrimaryRoleLabels = async (language: string): Promise<Result<Record<string, string>>> => {
	'use cache';

	return withStoryblokCache(service.getPrimaryRoleLabels(language));
};

export const getAllPersons = async (language: string): Promise<Result<ISbStoryData<Person>[]>> => {
	'use cache';

	return withStoryblokCache(service.getAllPersons(language));
};

export const getOverviewArticleTypes = async (language: string): Promise<Result<ISbStoryData<ArticleType>[]>> => {
	'use cache';

	return withStoryblokCache(service.getOverviewArticleTypes(language));
};

export const getPublishedPageLinks = async (): Promise<Result<StoryblokPublishedLink[]>> => {
	'use cache';

	return withStoryblokCache(service.getPublishedPageLinks());
};

export const getTag = async (slug: string, language: string): Promise<Result<ISbStoryData<Tag>>> => {
	'use cache';

	return withStoryblokCache(service.getTag(slug, language));
};

export const getArticleType = async (slug: string, language: string): Promise<Result<ISbStoryData<ArticleType>>> => {
	'use cache';

	return withStoryblokCache(service.getArticleType(slug, language));
};

export const getCountries = async (language: string): Promise<Result<ISbStoryData<Country>[]>> => {
	'use cache';

	return withStoryblokCache(service.getCountries(language));
};

export const getPrograms = async (language: string): Promise<Result<ISbStoryData<Program>[]>> => {
	'use cache';

	return withStoryblokCache(service.getPrograms(language));
};

export const getCampaigns = async (language: string): Promise<Result<ISbStoryData<Campaign>[]>> => {
	'use cache';

	return withStoryblokCache(service.getCampaigns(language));
};

export const getProgramBySlug = async (slug: string, language: string): Promise<Result<ISbStoryData<Program>>> => {
	'use cache';

	return withStoryblokCache(service.getProgramBySlug(slug, language));
};

export const getCampaignBySlug = async (slug: string, language: string): Promise<Result<ISbStoryData<Campaign>>> => {
	'use cache';

	return withStoryblokCache(service.getCampaignBySlug(slug, language));
};

export const getCountryBySlug = async (slug: string, language: string): Promise<Result<ISbStoryData<Country>>> => {
	'use cache';

	return withStoryblokCache(service.getCountryBySlug(slug, language));
};

export const getCountryByIsoCode = async (isoCode: string, language: string): Promise<Result<ISbStoryData<Country>>> => {
	'use cache';

	return withStoryblokCache(service.getCountryByIsoCode(isoCode, language));
};

export const getLocalPartners = async (language: string): Promise<Result<ISbStoryData<LocalPartner>[]>> => {
	'use cache';

	return withStoryblokCache(service.getLocalPartners(language));
};

export const getLocalPartnerBySlug = async (slug: string, language: string): Promise<Result<ISbStoryData<LocalPartner>>> => {
	'use cache';

	return withStoryblokCache(service.getLocalPartnerBySlug(slug, language));
};

export const getFocuses = async (language: string): Promise<Result<ISbStoryData<Focus>[]>> => {
	'use cache';

	return withStoryblokCache(service.getFocuses(language));
};

export const getFocusBySlug = async (slug: string, language: string): Promise<Result<ISbStoryData<Focus>>> => {
	'use cache';

	return withStoryblokCache(service.getFocusBySlug(slug, language));
};

export const getCommunityGlobals = async (language: string): Promise<Result<ISbStoryData<CommunityGlobals>>> => {
	'use cache';

	return withStoryblokCache(service.getCommunityGlobals(language));
};

export const getPerson = async (slug: string, language: string): Promise<Result<ISbStoryData<Person>>> => {
	'use cache';

	return withStoryblokCache(service.getPerson(slug, language));
};

export const getArticlesByTag = async (
	tagId: string,
	language: string,
): Promise<Result<ISbStoryData<ResolvedArticle>[]>> => {
	'use cache';

	return withStoryblokCache(service.getArticlesByTag(tagId, language));
};

export const getArticlesByArticleType = async (
	articleTypeId: string,
	language: string,
): Promise<Result<ISbStoryData<ResolvedArticle>[]>> => {
	'use cache';

	return withStoryblokCache(service.getArticlesByArticleType(articleTypeId, language));
};

export const getArticlesByAuthor = async (
	authorId: string,
	language: string,
): Promise<Result<ISbStoryData<ResolvedArticle>[]>> => {
	'use cache';

	return withStoryblokCache(service.getArticlesByAuthor(authorId, language));
};

export const getOverviewArticles = async (
	language: string,
	idsToIgnore?: string,
	limit?: number,
): Promise<Result<ISbStoryData<ResolvedArticle>[]>> => {
	'use cache';

	return withStoryblokCache(service.getOverviewArticles(language, idsToIgnore, limit));
};

export const getPublishedJournalArticles = async (language: string): Promise<Result<ISbStoryData<Article>[]>> => {
	'use cache';

	return withStoryblokCache(service.getPublishedJournalArticles(language));
};

export const getLatestJournalArticles = async (
	language: string,
	limit?: number,
): Promise<Result<ISbStoryData<ResolvedArticle>[]>> => {
	'use cache';

	return withStoryblokCache(service.getLatestJournalArticles(language, limit));
};

export const getArticlesByUuids = async (
	language: string,
	articleUuids: string[],
): Promise<Result<ISbStoryData<ResolvedArticle>[]>> => {
	'use cache';

	return withStoryblokCache(service.getArticlesByUuids(language, articleUuids));
};

export const getArticle = async (language: string, slug: string): Promise<Result<ISbStoryData<ResolvedArticle>>> => {
	'use cache';

	return withStoryblokCache(service.getArticle(language, slug));
};

export const getRelativeArticles = async (
	authorId: string,
	articleId: number,
	tags: string[],
	language: string,
	numberOfArticles: number,
): Promise<Result<ISbStoryData<ResolvedArticle>[]>> => {
	'use cache';

	return withStoryblokCache(service.getRelativeArticles(authorId, articleId, tags, language, numberOfArticles));
};

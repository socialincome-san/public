import type {
	ArticleType,
	Campaign,
	Country,
	Focus,
	LocalPartner,
	Person,
	Program,
	Tag,
} from '@/generated/storyblok/types/109655/storyblok-components';
import {
	fetchStoryblokDatasourceEntries,
	fetchStoryblokLinks,
	fetchStoryblokStories,
	fetchStoryblokStoriesPage,
	fetchStoryblokStory,
} from '@/integrations/storyblok/storyblok-content.integration';
import { fetchStoryblokPrograms } from '@/integrations/storyblok/storyblok-program.integration';
import { defaultLanguage } from '@/lib/i18n/utils';
import { resultFail, resultOk, type ServiceResult } from '@/lib/service-result';
import {
	getCampaignStoryPath,
	getJournalArticleStoryPath,
	getJournalArticleTypeStoryPath,
	getJournalTagStoryPath,
	getPersonStoryPath,
	getProgramStoryPath,
	STORYBLOK_CAMPAIGNS_FOLDER,
	STORYBLOK_COUNTRIES_FOLDER,
	STORYBLOK_FOCUSES_FOLDER,
	STORYBLOK_LOCAL_PARTNERS_FOLDER,
	STORYBLOK_PAGES_FOLDER,
} from '@/lib/storyblok/storyblok-paths';
import type { ISbStoriesParams, ISbStoryData } from '@storyblok/js';
import { draftMode } from 'next/headers';
import { cache } from 'react';
import type { ResolvedArticle, StoryblokPublishedLink, StoryTitleData } from './storyblok-content.types';

const CONTENT_TYPE = {
	article: 'article',
	articleType: 'articleType',
	campaign: 'Campaign',
	country: 'Country',
	focus: 'Focus',
	localPartner: 'Local Partner',
	person: 'person',
	tag: 'tag',
} as const;
const STANDARD_ARTICLE_RELATIONS = ['article.author', 'article.tags', 'article.type'];
const STANDARD_STORY_RELATIONS = [
	'faqSelection.questions',
	'Campaign.faq',
	'campaignGlobals.faq',
	'program.faq',
	'downloads.documents',
	'partnershipsCarousel.partnerships',
	'partnershipsCard.partnerships',
	'Country.partners',
	'Local Partner.focuses',
	'Local Partner.partners',
];
const COUNTRY_RELATIONS = ['Country.partners'];
const FOCUS_RELATIONS = ['Focus.studies'];
const LOCAL_PARTNER_RELATIONS = ['Local Partner.focuses', 'Local Partner.partners'];
const DEFAULT_PAGE_SIZE = 50;
const CONTENT_FIELD = 'content';
const EXCLUDED_FIELDS_FOR_COUNTING = 'content,leadText';
const STORIES_PATH_PARAMS = {
	countries: STORYBLOK_COUNTRIES_FOLDER,
	focuses: STORYBLOK_FOCUSES_FOLDER,
	localPartners: STORYBLOK_LOCAL_PARTNERS_FOLDER,
	campaigns: STORYBLOK_CAMPAIGNS_FOLDER,
} as const;
const PRIMARY_ROLES_DATASOURCE = 'primaryroles';

const JOURNAL_TEASER_LIMIT = 3;

type StoryblokDatasourceEntry = {
	value: string;
	name: string;
	dimension_value?: string | null;
};

type StoryblokFilterQuery = Record<string, unknown>;

const fetchDatasourceEntriesCached = cache(
	async (datasourceSlug: string, language: string): Promise<ServiceResult<StoryblokDatasourceEntry[]>> =>
		fetchStoryblokDatasourceEntries<StoryblokDatasourceEntry>({
			datasource: datasourceSlug,
			dimension: language,
			per_page: 100,
		}),
);

export const getStoryWithFallback = async <T>(slug: string, language: string): Promise<ServiceResult<T>> => {
	const params = await getStoryParams(language);
	const result = await fetchStoryblokStory<T>(slug, {
		...params,
		resolve_relations: STANDARD_STORY_RELATIONS,
	});
	if (result.success || result.status !== 404 || language === defaultLanguage) {
		return result.success ? result : resultFail('Could not fetch Storyblok story', result.status);
	}

	const fallback = await fetchStoryblokStory<T>(slug, {
		...(await getStoryParams(defaultLanguage)),
		resolve_relations: STANDARD_STORY_RELATIONS,
	});

	return fallback.success ? fallback : resultFail('Could not fetch Storyblok story', fallback.status);
};

export const getStoryTitle = async (slug: string, language: string): Promise<ServiceResult<StoryTitleData>> => {
	const result = await fetchStoryWithOptionalLanguageFallback<StoryTitleData>(slug, language);

	return result ?? resultFail('Story not found', 404);
};

export const getOverviewArticlesCountForDefaultLang = async (): Promise<ServiceResult<number>> =>
	getArticleCount({
		displayInOverviewPage: { is: true },
	});

export const getArticleCountByTagForDefaultLang = async (tagId: string): Promise<ServiceResult<number>> =>
	getArticleCount(articleByTagsFilter(tagId));

export const getArticleCountByArticleTypeForDefaultLang = async (articleTypeId: string): Promise<ServiceResult<number>> =>
	getArticleCount(articlesByArticleTypeFilter(articleTypeId));

export const getArticleCountByAuthorForDefaultLang = async (authorId: string): Promise<ServiceResult<number>> =>
	getArticleCount(articlesByAuthorFilter(authorId));

export const getPersonsByUuids = async (
	language: string,
	personUuids: string[],
): Promise<ServiceResult<ISbStoryData<Person>[]>> => {
	const uuids = uniqueTrimmed(personUuids);
	if (uuids.length === 0) {
		return resultOk([]);
	}

	return fetchStoryblokStories<ISbStoryData<Person>>({
		...(await getStoryParams(language)),
		per_page: uuids.length,
		content_type: CONTENT_TYPE.person,
		by_uuids_ordered: uuids.join(','),
	});
};

export const getOverviewAuthors = async (language: string): Promise<ServiceResult<ISbStoryData<Person>[]>> => {
	const result = await fetchStoryblokStories<ISbStoryData<Person>>({
		...(await getStoryParams(language)),
		content_type: CONTENT_TYPE.person,
		filter_query: { displayInOverviewPage: { is: true } },
	});

	return result.success ? result : resultOk([]);
};

export const getPersonsByCountryOffice = async (
	language: string,
	isoCodes: string[],
): Promise<ServiceResult<ISbStoryData<Person>[]>> => {
	const countryOfficeCodes = isoCodes.map((code) => code.trim()).filter(Boolean);
	if (countryOfficeCodes.length === 0) {
		return resultOk([]);
	}

	return fetchStoryblokStories<ISbStoryData<Person>>({
		...(await getStoryParams(language)),
		content_type: CONTENT_TYPE.person,
		filter_query: { countryOffice: { any_in_array: countryOfficeCodes.join(',') } },
	});
};

const getDatasourceEntries = async (
	datasourceSlug: string,
	language: string,
): Promise<ServiceResult<Record<string, string>>> => {
	const result = await fetchDatasourceEntriesCached(datasourceSlug, language);
	if (!result.success) {
		return resultFail('Could not fetch Storyblok datasource entries');
	}

	return resultOk(Object.fromEntries(result.data.map((entry) => [entry.value, entry.dimension_value ?? entry.name])));
};

export const getPrimaryRoleLabels = async (language: string): Promise<ServiceResult<Record<string, string>>> =>
	getDatasourceEntries(PRIMARY_ROLES_DATASOURCE, language);

export const getAllPersons = async (language: string): Promise<ServiceResult<ISbStoryData<Person>[]>> =>
	fetchStoryblokStories<ISbStoryData<Person>>({
		...(await getStoryParams(language)),
		content_type: CONTENT_TYPE.person,
	});

export const getOverviewArticleTypes = async (language: string): Promise<ServiceResult<ISbStoryData<ArticleType>[]>> => {
	const result = await fetchStoryblokStories<ISbStoryData<ArticleType>>({
		...(await getStoryParams(language)),
		content_type: CONTENT_TYPE.articleType,
		filter_query: { displayInOverviewPage: { is: true } },
		sort_by: 'content.sortOrder:asc:int',
	});

	return result.success ? result : resultOk([]);
};

export const getPublishedPageLinks = async (): Promise<ServiceResult<StoryblokPublishedLink[]>> => {
	const result = await fetchStoryblokLinks<unknown>({
		version: 'published',
		starts_with: `${STORYBLOK_PAGES_FOLDER}/`,
	});
	if (!result.success) {
		return resultFail('Could not fetch Storyblok page links');
	}

	return resultOk(result.data.filter(isStoryblokPublishedLink));
};

export const getTag = async (slug: string, language: string): Promise<ServiceResult<ISbStoryData<Tag>>> =>
	fetchTypedStoryWithFallback<ISbStoryData<Tag>>(getJournalTagStoryPath(slug), language);

export const getArticleType = async (slug: string, language: string): Promise<ServiceResult<ISbStoryData<ArticleType>>> =>
	fetchTypedStoryWithFallback<ISbStoryData<ArticleType>>(getJournalArticleTypeStoryPath(slug), language);

export const getCountries = async (language: string): Promise<ServiceResult<ISbStoryData<Country>[]>> => {
	const result = await fetchFilteredStoriesWithDraftFallback(
		language,
		STORIES_PATH_PARAMS.countries,
		isCountryStory,
		COUNTRY_RELATIONS,
	);

	return result.success ? result : resultOk([]);
};

export const getPrograms = async (language: string): Promise<ServiceResult<ISbStoryData<Program>[]>> => {
	const { version } = await getStoryParams(language);

	return fetchStoryblokPrograms(language, version);
};

export const getCampaigns = async (language: string): Promise<ServiceResult<ISbStoryData<Campaign>[]>> => {
	const result = await fetchFilteredStoriesWithDraftFallback(language, STORIES_PATH_PARAMS.campaigns, isListedCampaignStory);

	return result.success ? result : resultOk([]);
};

export const getProgramBySlug = async (slug: string, language: string): Promise<ServiceResult<ISbStoryData<Program>>> => {
	const result = await fetchStoryWithOptionalLanguageFallback<ISbStoryData<Program>>(
		getProgramStoryPath(slug),
		language,
		STANDARD_STORY_RELATIONS,
	);

	return result ?? resultFail('Program not found', 404);
};

export const getCampaignBySlug = async (slug: string, language: string): Promise<ServiceResult<ISbStoryData<Campaign>>> => {
	const result = await fetchStoryWithOptionalLanguageFallback<ISbStoryData<Campaign>>(
		getCampaignStoryPath(slug),
		language,
		STANDARD_STORY_RELATIONS,
	);

	return result ?? resultFail('Campaign not found', 404);
};

export const getCountryBySlug = async (slug: string, language: string): Promise<ServiceResult<ISbStoryData<Country>>> => {
	const selected = await findCountry(language, (country) => matchesStorySlug(country, slug));
	if (selected) {
		return resultOk(selected);
	}
	if (language !== defaultLanguage) {
		const fallback = await findCountry(defaultLanguage, (country) => matchesStorySlug(country, slug));
		if (fallback) {
			return resultOk(fallback);
		}
	}

	return resultFail('Country not found', 404);
};

export const getCountryByIsoCode = async (
	isoCode: string,
	language: string,
): Promise<ServiceResult<ISbStoryData<Country>>> => {
	const normalizedIsoCode = isoCode.trim().toLowerCase();
	const matchesIsoCode = (country: ISbStoryData<Country>) =>
		country.content.isoCode?.toString().trim().toLowerCase() === normalizedIsoCode;
	const selected = await findCountry(language, matchesIsoCode);
	if (selected) {
		return resultOk(selected);
	}
	if (language !== defaultLanguage) {
		const fallback = await findCountry(defaultLanguage, matchesIsoCode);
		if (fallback) {
			return resultOk(fallback);
		}
	}

	return resultFail('Country not found', 404);
};

export const getLocalPartners = async (language: string): Promise<ServiceResult<ISbStoryData<LocalPartner>[]>> => {
	const result = await fetchFilteredStoriesWithDraftFallback(
		language,
		STORIES_PATH_PARAMS.localPartners,
		isLocalPartnerStory,
		LOCAL_PARTNER_RELATIONS,
	);

	return result.success ? result : resultFail('Could not fetch Storyblok local partners');
};

export const getLocalPartnerBySlug = async (
	slug: string,
	language: string,
): Promise<ServiceResult<ISbStoryData<LocalPartner>>> => {
	const selected = await findLocalPartner(language, slug);
	if (selected) {
		return resultOk(selected);
	}
	if (language !== defaultLanguage) {
		const fallback = await findLocalPartner(defaultLanguage, slug);
		if (fallback) {
			return resultOk(fallback);
		}
	}

	return resultFail('Local partner not found', 404);
};

export const getFocuses = async (language: string): Promise<ServiceResult<ISbStoryData<Focus>[]>> => {
	const result = await fetchFilteredStoriesWithDraftFallback(
		language,
		STORIES_PATH_PARAMS.focuses,
		isFocusStory,
		FOCUS_RELATIONS,
	);

	return result.success ? result : resultFail('Could not fetch Storyblok focuses');
};

export const getFocusBySlug = async (slug: string, language: string): Promise<ServiceResult<ISbStoryData<Focus>>> => {
	const selected = await findFocus(language, slug);
	if (selected) {
		return resultOk(selected);
	}
	if (language !== defaultLanguage) {
		const fallback = await findFocus(defaultLanguage, slug);
		if (fallback) {
			return resultOk(fallback);
		}
	}

	return resultFail('Focus not found', 404);
};

export const getPerson = async (slug: string, language: string): Promise<ServiceResult<ISbStoryData<Person>>> =>
	fetchTypedStoryWithFallback<ISbStoryData<Person>>(getPersonStoryPath(slug), language);

export const getArticlesByTag = async (
	tagId: string,
	language: string,
): Promise<ServiceResult<ISbStoryData<ResolvedArticle>[]>> => fetchResolvedArticles(language, articleByTagsFilter(tagId));

export const getArticlesByArticleType = async (
	articleTypeId: string,
	language: string,
): Promise<ServiceResult<ISbStoryData<ResolvedArticle>[]>> =>
	fetchResolvedArticles(language, articlesByArticleTypeFilter(articleTypeId));

export const getArticlesByAuthor = async (
	authorId: string,
	language: string,
): Promise<ServiceResult<ISbStoryData<ResolvedArticle>[]>> =>
	fetchResolvedArticles(language, articlesByAuthorFilter(authorId));

export const getOverviewArticles = async (
	language: string,
	idsToIgnore?: string,
	limit?: number,
): Promise<ServiceResult<ISbStoryData<ResolvedArticle>[]>> => {
	const params: ISbStoriesParams = {
		...(await getStoryParams(language)),
		per_page: limit ?? DEFAULT_PAGE_SIZE,
		excluding_fields: CONTENT_FIELD,
		resolve_relations: STANDARD_ARTICLE_RELATIONS,
		sort_by: 'first_published_at:desc',
		content_type: CONTENT_TYPE.article,
		filter_query: { displayInOverviewPage: { is: true } },
		...(idsToIgnore ? { excluding_ids: idsToIgnore } : {}),
	};
	const result = limit ? await fetchStoryblokStoriesPage<unknown>(params) : await fetchStoryblokStories<unknown>(params);
	if (!result.success) {
		return resultOk([]);
	}
	const stories = 'stories' in result.data ? result.data.stories : result.data;

	return resultOk(stories.filter(isResolvedArticle));
};

export const getLatestJournalArticles = async (
	language: string,
	limit = JOURNAL_TEASER_LIMIT,
): Promise<ServiceResult<ISbStoryData<ResolvedArticle>[]>> => {
	const result = await getOverviewArticles(language, undefined, limit);

	return resultOk(result.success ? result.data.slice(0, limit) : []);
};

export const getArticlesByUuids = async (
	language: string,
	articleUuids: string[],
): Promise<ServiceResult<ISbStoryData<ResolvedArticle>[]>> => {
	const uuids = uniqueTrimmed(articleUuids);
	if (uuids.length === 0) {
		return resultOk([]);
	}
	const result = await fetchStoryblokStoriesPage<unknown>({
		...(await getStoryParams(language)),
		per_page: uuids.length,
		excluding_fields: CONTENT_FIELD,
		resolve_relations: STANDARD_ARTICLE_RELATIONS,
		content_type: CONTENT_TYPE.article,
		by_uuids_ordered: uuids.join(','),
	});

	return result.success ? resultOk(result.data.stories.filter(isResolvedArticle)) : resultOk([]);
};

export const getArticle = async (language: string, slug: string): Promise<ServiceResult<ISbStoryData<ResolvedArticle>>> => {
	const result = await fetchStoryWithOptionalLanguageFallback<unknown>(
		getJournalArticleStoryPath(slug),
		language,
		STANDARD_ARTICLE_RELATIONS,
	);
	if (!result) {
		return resultFail('Article not found', 404);
	}
	if (!result.success) {
		return resultFail(result.error, result.status);
	}
	if (!isResolvedArticle(result.data)) {
		return resultFail('Article relations are unresolved');
	}

	return resultOk(result.data);
};

export const getRelativeArticles = async (
	authorId: string,
	articleId: number,
	tags: string[],
	language: string,
	numberOfArticles: number,
): Promise<ServiceResult<ISbStoryData<ResolvedArticle>[]>> => {
	const related = await fetchStoryblokStoriesPage<unknown>({
		...(await getStoryParams(language)),
		per_page: numberOfArticles,
		excluding_fields: CONTENT_FIELD,
		resolve_relations: STANDARD_ARTICLE_RELATIONS,
		sort_by: 'first_published_at:desc',
		excluding_ids: articleId.toString(),
		content_type: CONTENT_TYPE.article,
		filter_query: createRelativeArticlesFilter(tags, authorId),
	});
	let articles = related.success ? related.data.stories.filter(isResolvedArticle) : [];
	if (articles.length < numberOfArticles) {
		const idsToIgnore = [...articles.map((story) => story.id), articleId].join(',');
		const overview = await getOverviewArticles(language, idsToIgnore, numberOfArticles - articles.length);
		if (overview.success) {
			articles = [...articles, ...overview.data];
		}
	}

	return resultOk(articles);
};

const getStoryParams = async (language: string): Promise<ISbStoriesParams> => ({
	language,
	version: (await draftMode()).isEnabled ? 'draft' : 'published',
});

const fetchStoryWithOptionalLanguageFallback = async <T>(
	slug: string,
	language: string,
	resolveRelations?: string[],
): Promise<ServiceResult<T> | undefined> => {
	const result = await fetchStoryblokStory<T>(slug, {
		...(await getStoryParams(language)),
		...(resolveRelations ? { resolve_relations: resolveRelations } : {}),
	});
	if (result.success || result.status !== 404) {
		return result;
	}
	if (language === defaultLanguage) {
		return undefined;
	}
	const fallback = await fetchStoryblokStory<T>(slug, {
		...(await getStoryParams(defaultLanguage)),
		...(resolveRelations ? { resolve_relations: resolveRelations } : {}),
	});

	return fallback.success || fallback.status !== 404 ? fallback : undefined;
};

const fetchTypedStoryWithFallback = async <T>(slug: string, language: string): Promise<ServiceResult<T>> => {
	const result = await fetchStoryWithOptionalLanguageFallback<T>(slug, language);

	return result ?? resultFail('Storyblok content not found', 404);
};

const fetchFilteredStoriesWithDraftFallback = async <T>(
	language: string,
	folder: string,
	isExpectedStory: (story: unknown) => story is T,
	resolveRelations?: string[],
): Promise<ServiceResult<T[]>> => {
	const baseParams: ISbStoriesParams = {
		...(await getStoryParams(language)),
		starts_with: `${folder}/`,
		...(resolveRelations ? { resolve_relations: resolveRelations } : {}),
	};
	const result = await fetchStoryblokStories<unknown>(baseParams);
	if (!result.success) {
		return resultFail('Could not fetch Storyblok stories');
	}
	const stories = result.data.filter(isExpectedStory);
	if (stories.length > 0 || !shouldFallbackToDraft(baseParams.version)) {
		return resultOk(stories);
	}

	const draftResult = await fetchStoryblokStories<unknown>({ ...baseParams, version: 'draft' });

	return draftResult.success
		? resultOk(draftResult.data.filter(isExpectedStory))
		: resultFail('Could not fetch Storyblok stories');
};

const shouldFallbackToDraft = (version: ISbStoriesParams['version']): boolean =>
	process.env.NODE_ENV !== 'production' && version === 'published';

const getArticleCount = async (filterQuery: StoryblokFilterQuery): Promise<ServiceResult<number>> => {
	const result = await fetchStoryblokStoriesPage<unknown>({
		...(await getStoryParams(defaultLanguage)),
		per_page: 1,
		excluding_fields: EXCLUDED_FIELDS_FOR_COUNTING,
		content_type: CONTENT_TYPE.article,
		filter_query: filterQuery,
	});

	return result.success ? resultOk(result.data.total) : resultFail('Could not count Storyblok articles');
};

const fetchResolvedArticles = async (
	language: string,
	filterQuery: StoryblokFilterQuery,
): Promise<ServiceResult<ISbStoryData<ResolvedArticle>[]>> => {
	const result = await fetchStoryblokStories<unknown>({
		...(await getStoryParams(language)),
		per_page: DEFAULT_PAGE_SIZE,
		resolve_relations: STANDARD_ARTICLE_RELATIONS,
		excluding_fields: CONTENT_FIELD,
		sort_by: 'first_published_at:desc',
		content_type: CONTENT_TYPE.article,
		filter_query: filterQuery,
	});

	return result.success ? resultOk(result.data.filter(isResolvedArticle)) : resultOk([]);
};

const isResolvedRelation = (value: unknown): value is ISbStoryData =>
	typeof value === 'object' &&
	value !== null &&
	'content' in value &&
	typeof value.content === 'object' &&
	value.content !== null;

const isResolvedArticle = (story: unknown): story is ISbStoryData<ResolvedArticle> => {
	if (!isResolvedRelation(story) || !isResolvedRelation(story.content.author) || !isResolvedRelation(story.content.type)) {
		return false;
	}
	const { tags } = story.content;

	return tags === undefined || tags === null || (Array.isArray(tags) && tags.every(isResolvedRelation));
};

const isStoryWithComponent = (story: unknown, component: string): story is ISbStoryData<Record<string, unknown>> =>
	isResolvedRelation(story) &&
	'component' in story.content &&
	typeof story.content.component === 'string' &&
	story.content.component.toLowerCase() === component.toLowerCase();

const isCountryStory = (story: unknown): story is ISbStoryData<Country> => isStoryWithComponent(story, CONTENT_TYPE.country);

const isCampaignStory = (story: unknown): story is ISbStoryData<Campaign> =>
	isStoryWithComponent(story, CONTENT_TYPE.campaign);

const isListedCampaignStory = (story: unknown): story is ISbStoryData<Campaign> =>
	isCampaignStory(story) && story.content.public === true && story.content.approved === true;

const isLocalPartnerStory = (story: unknown): story is ISbStoryData<LocalPartner> =>
	isStoryWithComponent(story, CONTENT_TYPE.localPartner);

const isFocusStory = (story: unknown): story is ISbStoryData<Focus> => isStoryWithComponent(story, CONTENT_TYPE.focus);

const isStoryblokPublishedLink = (value: unknown): value is StoryblokPublishedLink =>
	typeof value === 'object' &&
	value !== null &&
	'slug' in value &&
	'is_folder' in value &&
	'published' in value &&
	typeof value.slug === 'string' &&
	typeof value.is_folder === 'boolean' &&
	typeof value.published === 'boolean';

const uniqueTrimmed = (values: string[]): string[] => [...new Set(values.map((value) => value.trim()).filter(Boolean))];

const matchesStorySlug = <T>(story: ISbStoryData<T>, slug: string): boolean =>
	story.slug === slug.trim() || story.full_slug?.split('/').at(-1) === slug.trim();

const findCountry = async (
	language: string,
	predicate: (country: ISbStoryData<Country>) => boolean,
): Promise<ISbStoryData<Country> | undefined> => {
	const result = await getCountries(language);

	return result.success ? result.data.find(predicate) : undefined;
};

const findLocalPartner = async (language: string, slug: string): Promise<ISbStoryData<LocalPartner> | undefined> => {
	const result = await getLocalPartners(language);

	return result.success ? result.data.find((story) => matchesStorySlug(story, slug)) : undefined;
};

const findFocus = async (language: string, slug: string): Promise<ISbStoryData<Focus> | undefined> => {
	const normalizedSlug = slug.trim();
	const result = await getFocuses(language);

	return result.success
		? result.data.find(
				(story) => matchesStorySlug(story, normalizedSlug) || story.content.portalSlug?.trim() === normalizedSlug,
			)
		: undefined;
};

const articleByTagsFilter = (tagId: string) => ({ tags: { any_in_array: tagId } });

const articlesByArticleTypeFilter = (articleTypeId: string) => ({ type: { in: articleTypeId } });

const articlesByAuthorFilter = (authorId: string) => ({ author: { in: authorId } });

const createRelativeArticlesFilter = (tags: string[], authorId: string) =>
	tags.length > 0
		? { __or: [{ author: { in: authorId } }, { tags: { in_array: tags.join(',') } }] }
		: { author: { in: authorId } };

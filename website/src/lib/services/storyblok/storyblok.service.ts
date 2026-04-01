import type {
	Campaign,
	Country,
	Focus,
	LocalPartner,
	Person,
	Program,
	Tag,
} from '@/generated/storyblok/types/109655/storyblok-components';
import { defaultLanguage } from '@/lib/i18n/utils';
import { NEW_WEBSITE_SLUG } from '@/lib/utils/const';
import type { ISbStories, ISbStoriesParams, ISbStoryData } from '@storyblok/js';
import { draftMode } from 'next/headers';
import { notFound } from 'next/navigation';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { getStoryblokApi } from './storyblok.config';
import type { ResolvedArticle } from './storyblok.utils';

export class StoryblokService extends BaseService {
	private static readonly contentType = {
		article: 'article',
		campaign: 'campaign',
		country: 'Country',
		focus: 'Focus',
		localPartner: 'Local Partner',
		person: 'person',
		program: 'program',
		tag: 'tag',
	} as const;
	private static readonly standardArticleRelationsToResolve = ['article.author', 'article.tags', 'article.type'];
	private static readonly defaultPageSize = 50;
	private static readonly contentField = 'content';
	private static readonly leadTextField = 'leadText';
	private static readonly storiesPath = 'cdn/stories';
	private static readonly countriesPath = `${NEW_WEBSITE_SLUG}/countries`;
	private static readonly campaignsPath = `${NEW_WEBSITE_SLUG}/campaigns`;
	private static readonly focusesPath = `${NEW_WEBSITE_SLUG}/focuses`;
	private static readonly localPartnersPath = `${NEW_WEBSITE_SLUG}/local-partners`;
	private static readonly programsPath = `${NEW_WEBSITE_SLUG}/programs`;
	private static readonly excludedFieldsForCounting = [StoryblokService.contentField, StoryblokService.leadTextField].join(
		',',
	);

	private static isCountryStory(story: unknown): story is ISbStoryData<Country> {
		if (!story || typeof story !== 'object' || !('content' in story)) {
			return false;
		}

		const storyWithContent = story as { content?: unknown };
		if (!storyWithContent.content || typeof storyWithContent.content !== 'object') {
			return false;
		}

		const contentWithComponent = storyWithContent.content as { component?: string };

		return contentWithComponent.component?.toLowerCase() === StoryblokService.contentType.country.toLowerCase();
	}

	private static isProgramStory(story: unknown): story is ISbStoryData<Program> {
		if (!story || typeof story !== 'object' || !('content' in story)) {
			return false;
		}

		const storyWithContent = story as { content?: unknown };
		if (!storyWithContent.content || typeof storyWithContent.content !== 'object') {
			return false;
		}

		const contentWithComponent = storyWithContent.content as { component?: string };

		return contentWithComponent.component?.toLowerCase() === StoryblokService.contentType.program.toLowerCase();
	}

	private static isCampaignStory(story: unknown): story is ISbStoryData<Campaign> {
		if (!story || typeof story !== 'object' || !('content' in story)) {
			return false;
		}

		const storyWithContent = story as { content?: unknown };
		if (!storyWithContent.content || typeof storyWithContent.content !== 'object') {
			return false;
		}

		const contentWithComponent = storyWithContent.content as { component?: string };

		return contentWithComponent.component?.toLowerCase() === StoryblokService.contentType.campaign.toLowerCase();
	}

	private static isLocalPartnerStory(story: unknown): story is ISbStoryData<LocalPartner> {
		if (!story || typeof story !== 'object' || !('content' in story)) {
			return false;
		}

		const storyWithContent = story as { content?: unknown };
		if (!storyWithContent.content || typeof storyWithContent.content !== 'object') {
			return false;
		}

		const contentWithComponent = storyWithContent.content as { component?: string };

		return contentWithComponent.component?.toLowerCase() === StoryblokService.contentType.localPartner.toLowerCase();
	}

	private static isFocusStory(story: unknown): story is ISbStoryData<Focus> {
		if (!story || typeof story !== 'object' || !('content' in story)) {
			return false;
		}

		const storyWithContent = story as { content?: unknown };
		if (!storyWithContent.content || typeof storyWithContent.content !== 'object') {
			return false;
		}

		const contentWithComponent = storyWithContent.content as { component?: string };

		return contentWithComponent.component?.toLowerCase() === StoryblokService.contentType.focus.toLowerCase();
	}

	private static shouldFallbackToDraft(version: ISbStoriesParams['version']) {
		return process.env.NODE_ENV !== 'production' && version === 'published';
	}

	private async getStoryParams(language: string): Promise<ISbStoriesParams> {
		return {
			language,
			version: (await draftMode()).isEnabled ? 'draft' : 'published',
		};
	}

	private async withLanguageFallback<T>(
		loader: (lang: string, slug: string) => Promise<T>,
		lang: string,
		slug: string,
	): Promise<T> {
		try {
			return await loader(lang, slug);
		} catch (error: unknown) {
			const errorStatus = typeof error === 'object' && error !== null && 'status' in error ? error.status : undefined;
			if (errorStatus === 404) {
				if (lang === defaultLanguage) {
					return notFound();
				}

				return await this.withLanguageFallback(loader, defaultLanguage, slug);
			}
			throw error;
		}
	}

	async getStoryWithFallback<T>(slug: string, lang: string): Promise<ServiceResult<T>> {
		try {
			const data = await this.withLanguageFallback(
				async (language: string) => {
					const response = await getStoryblokApi().get(`cdn/stories/${slug}`, await this.getStoryParams(language));
					const responseData = response.data as { story: T };

					return responseData.story;
				},
				lang,
				slug,
			);

			return this.resultOk(data);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Failed to fetch story: ${JSON.stringify(error)}`);
		}
	}

	async getOverviewArticlesCountForDefaultLang(): Promise<ServiceResult<number>> {
		try {
			const params: ISbStoriesParams = {
				...(await this.getStoryParams(defaultLanguage)),
				per_page: 1,
				excluding_fields: StoryblokService.excludedFieldsForCounting,
				content_type: StoryblokService.contentType.article,
				filter_query: { displayInOverviewPage: { is: true } },
			};
			const res = await getStoryblokApi().get(StoryblokService.storiesPath, params);

			return this.resultOk(res.total);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Failed to count overview articles: ${JSON.stringify(error)}`);
		}
	}

	async getArticleCountByTagForDefaultLang(tagId: string): Promise<ServiceResult<number>> {
		try {
			const params: ISbStoriesParams = {
				...(await this.getStoryParams(defaultLanguage)),
				per_page: 1,
				excluding_fields: StoryblokService.excludedFieldsForCounting,
				content_type: StoryblokService.contentType.article,
				filter_query: this.articleByTagsFilter(tagId),
			};
			const res = await getStoryblokApi().get(StoryblokService.storiesPath, params);

			return this.resultOk(res.total);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Failed to count articles by tag: ${JSON.stringify(error)}`);
		}
	}

	async getArticleCountByAuthorForDefaultLang(authorId: string): Promise<ServiceResult<number>> {
		try {
			const params: ISbStoriesParams = {
				...(await this.getStoryParams(defaultLanguage)),
				per_page: 1,
				excluding_fields: StoryblokService.excludedFieldsForCounting,
				content_type: StoryblokService.contentType.article,
				filter_query: this.articlesByAuthorFilter(authorId),
			};
			const res = await getStoryblokApi().get(StoryblokService.storiesPath, params);

			return this.resultOk(res.total);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Failed to count articles by author: ${JSON.stringify(error)}`);
		}
	}

	async getOverviewAuthors(lang: string): Promise<ServiceResult<ISbStoryData<Person>[]>> {
		try {
			const params: ISbStoriesParams = {
				...(await this.getStoryParams(lang)),
				content_type: StoryblokService.contentType.person,
				filter_query: { displayInOverviewPage: { is: true } },
			};
			const data = await getStoryblokApi().getAll(StoryblokService.storiesPath, params);

			return this.resultOk(data);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Failed to fetch focuses: ${JSON.stringify(error)}`);
		}
	}

	async getOverviewTags(lang: string): Promise<ServiceResult<ISbStoryData<Tag>[]>> {
		try {
			const params: ISbStoriesParams = {
				...(await this.getStoryParams(lang)),
				content_type: StoryblokService.contentType.tag,
				filter_query: { displayInOverviewPage: { is: true } },
			};
			const data = await getStoryblokApi().getAll(StoryblokService.storiesPath, params);

			return this.resultOk(data);
		} catch (error) {
			this.logger.error(error);

			return this.resultOk([]);
		}
	}

	async getTag(slug: string, lang: string): Promise<ServiceResult<ISbStoryData<Tag>>> {
		try {
			const res = await this.withLanguageFallback(
				async (l, s) => getStoryblokApi().get(`cdn/stories/tag/${s}`, await this.getStoryParams(l)),
				lang,
				slug,
			);

			return this.resultOk((res.data as { story: ISbStoryData<Tag> }).story);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Failed to fetch tag: ${JSON.stringify(error)}`);
		}
	}

	async getCountries(lang: string): Promise<ServiceResult<ISbStoryData<Country>[]>> {
		try {
			const baseParams = await this.getStoryParams(lang);
			const params: ISbStoriesParams = {
				...baseParams,
				starts_with: `${StoryblokService.countriesPath}/`,
			};
			const data = await getStoryblokApi().getAll(StoryblokService.storiesPath, params);
			let countries = data.filter((story) => StoryblokService.isCountryStory(story));

			if (countries.length === 0 && StoryblokService.shouldFallbackToDraft(baseParams.version)) {
				const draftParams: ISbStoriesParams = {
					...baseParams,
					version: 'draft',
					starts_with: `${StoryblokService.countriesPath}/`,
				};
				const draftData = await getStoryblokApi().getAll(StoryblokService.storiesPath, draftParams);
				countries = draftData.filter((story) => StoryblokService.isCountryStory(story));
			}

			return this.resultOk(countries);
		} catch (error) {
			this.logger.error(error);

			return this.resultOk([]);
		}
	}

	async getPrograms(lang: string): Promise<ServiceResult<ISbStoryData<Program>[]>> {
		try {
			const baseParams = await this.getStoryParams(lang);
			const params: ISbStoriesParams = {
				...baseParams,
				starts_with: `${StoryblokService.programsPath}/`,
			};
			const data = await getStoryblokApi().getAll(StoryblokService.storiesPath, params);
			let programs = data.filter((story) => StoryblokService.isProgramStory(story));

			if (programs.length === 0 && StoryblokService.shouldFallbackToDraft(baseParams.version)) {
				const draftParams: ISbStoriesParams = {
					...baseParams,
					version: 'draft',
					starts_with: `${StoryblokService.programsPath}/`,
				};
				const draftData = await getStoryblokApi().getAll(StoryblokService.storiesPath, draftParams);
				programs = draftData.filter((story) => StoryblokService.isProgramStory(story));
			}

			return this.resultOk(programs);
		} catch (error) {
			this.logger.error(error);

			return this.resultOk([]);
		}
	}

	async getProgramBySlug(slug: string, lang: string): Promise<ServiceResult<ISbStoryData<Program>>> {
		const loadProgram = async (language: string) => {
			const programs = await this.getPrograms(language);
			if (!programs.success) {
				return undefined;
			}

			return programs.data.find((program) => {
				const fullSlugTail = program.full_slug?.split('/').at(-1);

				return program.slug === slug || fullSlugTail === slug;
			});
		};

		try {
			let story = await loadProgram(lang);
			if (!story && lang !== defaultLanguage) {
				story = await loadProgram(defaultLanguage);
			}

			if (!story) {
				return this.resultFail(`Failed to fetch program: not found for slug '${slug}'`);
			}

			return this.resultOk(story);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Failed to fetch program: ${JSON.stringify(error)}`);
		}
	}

	async getCampaigns(lang: string): Promise<ServiceResult<ISbStoryData<Campaign>[]>> {
		try {
			const baseParams = await this.getStoryParams(lang);
			const params: ISbStoriesParams = {
				...baseParams,
				starts_with: `${StoryblokService.campaignsPath}/`,
			};
			const data = await getStoryblokApi().getAll(StoryblokService.storiesPath, params);
			let campaigns = data.filter((story) => StoryblokService.isCampaignStory(story));

			if (campaigns.length === 0 && StoryblokService.shouldFallbackToDraft(baseParams.version)) {
				const draftParams: ISbStoriesParams = {
					...baseParams,
					version: 'draft',
					starts_with: `${StoryblokService.campaignsPath}/`,
				};
				const draftData = await getStoryblokApi().getAll(StoryblokService.storiesPath, draftParams);
				campaigns = draftData.filter((story) => StoryblokService.isCampaignStory(story));
			}

			return this.resultOk(campaigns);
		} catch (error) {
			this.logger.error(error);

			return this.resultOk([]);
		}
	}

	async getCampaignBySlug(slug: string, lang: string): Promise<ServiceResult<ISbStoryData<Campaign>>> {
		const loadCampaign = async (language: string) => {
			const campaigns = await this.getCampaigns(language);
			if (!campaigns.success) {
				return undefined;
			}

			return campaigns.data.find((campaign) => {
				const fullSlugTail = campaign.full_slug?.split('/').at(-1);

				return campaign.slug === slug || fullSlugTail === slug;
			});
		};

		try {
			let story = await loadCampaign(lang);
			if (!story && lang !== defaultLanguage) {
				story = await loadCampaign(defaultLanguage);
			}

			if (!story) {
				return this.resultFail(`Failed to fetch campaign: not found for slug '${slug}'`);
			}

			return this.resultOk(story);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Failed to fetch campaign: ${JSON.stringify(error)}`);
		}
	}

	async getCountryBySlug(slug: string, lang: string): Promise<ServiceResult<ISbStoryData<Country>>> {
		const loadCountry = async (language: string) => {
			const countries = await this.getCountries(language);
			if (!countries.success) {
				return undefined;
			}

			return countries.data.find((country) => {
				const fullSlugTail = country.full_slug?.split('/').at(-1);

				return country.slug === slug || fullSlugTail === slug;
			});
		};

		try {
			let story = await loadCountry(lang);
			if (!story && lang !== defaultLanguage) {
				story = await loadCountry(defaultLanguage);
			}

			if (!story) {
				return this.resultFail(`Failed to fetch country: not found for slug '${slug}'`);
			}

			return this.resultOk(story);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Failed to fetch country: ${JSON.stringify(error)}`);
		}
	}

	async getLocalPartners(lang: string): Promise<ServiceResult<ISbStoryData<LocalPartner>[]>> {
		try {
			const baseParams = await this.getStoryParams(lang);
			const params: ISbStoriesParams = {
				...baseParams,
				starts_with: `${StoryblokService.localPartnersPath}/`,
			};
			const data = await getStoryblokApi().getAll(StoryblokService.storiesPath, params);
			let localPartners = data.filter((story) => StoryblokService.isLocalPartnerStory(story));

			if (localPartners.length === 0 && StoryblokService.shouldFallbackToDraft(baseParams.version)) {
				const draftParams: ISbStoriesParams = {
					...baseParams,
					version: 'draft',
					starts_with: `${StoryblokService.localPartnersPath}/`,
				};
				const draftData = await getStoryblokApi().getAll(StoryblokService.storiesPath, draftParams);
				localPartners = draftData.filter((story) => StoryblokService.isLocalPartnerStory(story));
			}

			return this.resultOk(localPartners);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Failed to fetch local partners: ${JSON.stringify(error)}`);
		}
	}

	async getLocalPartnerBySlug(slug: string, lang: string): Promise<ServiceResult<ISbStoryData<LocalPartner>>> {
		const normalizedSlug = slug.trim();
		const findLocalPartner = (localPartners: ISbStoryData<LocalPartner>[]) => {
			return localPartners.find((localPartner) => {
				const fullSlugTail = localPartner.full_slug?.split('/').at(-1);

				return localPartner.slug === normalizedSlug || fullSlugTail === normalizedSlug;
			});
		};

		try {
			const localPartners = await this.getLocalPartners(lang);
			if (!localPartners.success) {
				return this.resultFail(localPartners.error);
			}

			let story = findLocalPartner(localPartners.data);
			if (!story && lang !== defaultLanguage) {
				const fallbackLocalPartners = await this.getLocalPartners(defaultLanguage);
				if (!fallbackLocalPartners.success) {
					return this.resultFail(fallbackLocalPartners.error);
				}

				story = findLocalPartner(fallbackLocalPartners.data);
			}

			if (!story) {
				return this.resultFail(`Failed to fetch local partner: not found for slug '${slug}'`);
			}

			return this.resultOk(story);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Failed to fetch local partner: ${JSON.stringify(error)}`);
		}
	}

	async getFocuses(lang: string): Promise<ServiceResult<ISbStoryData<Focus>[]>> {
		try {
			const baseParams = await this.getStoryParams(lang);
			const params: ISbStoriesParams = {
				...baseParams,
				starts_with: `${StoryblokService.focusesPath}/`,
			};
			const data = await getStoryblokApi().getAll(StoryblokService.storiesPath, params);
			let focuses = data.filter((story) => StoryblokService.isFocusStory(story));

			if (focuses.length === 0 && StoryblokService.shouldFallbackToDraft(baseParams.version)) {
				const draftParams: ISbStoriesParams = {
					...baseParams,
					version: 'draft',
					starts_with: `${StoryblokService.focusesPath}/`,
				};
				const draftData = await getStoryblokApi().getAll(StoryblokService.storiesPath, draftParams);
				focuses = draftData.filter((story) => StoryblokService.isFocusStory(story));
			}

			return this.resultOk(focuses);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Failed to fetch focuses: ${JSON.stringify(error)}`);
		}
	}

	async getFocusBySlug(slug: string, lang: string): Promise<ServiceResult<ISbStoryData<Focus>>> {
		const normalizedSlug = slug.trim();
		const findFocus = (focuses: ISbStoryData<Focus>[]) => {
			return focuses.find((focus) => {
				const fullSlugTail = focus.full_slug?.split('/').at(-1);
				const focusId = focus.content.id?.trim();

				return focus.slug === normalizedSlug || fullSlugTail === normalizedSlug || focusId === normalizedSlug;
			});
		};

		try {
			const focuses = await this.getFocuses(lang);
			if (!focuses.success) {
				return this.resultFail(focuses.error);
			}

			let story = findFocus(focuses.data);
			if (!story && lang !== defaultLanguage) {
				const fallbackFocuses = await this.getFocuses(defaultLanguage);
				if (!fallbackFocuses.success) {
					return this.resultFail(fallbackFocuses.error);
				}

				story = findFocus(fallbackFocuses.data);
			}

			if (!story) {
				return this.resultFail(`Failed to fetch focus: not found for slug '${slug}'`);
			}

			return this.resultOk(story);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Failed to fetch focus: ${JSON.stringify(error)}`);
		}
	}

	async getPerson(slug: string, lang: string): Promise<ServiceResult<ISbStoryData<Person>>> {
		try {
			const res = await this.withLanguageFallback(
				async (l, s) => getStoryblokApi().get(`cdn/stories/person/${s}`, await this.getStoryParams(l)),
				lang,
				slug,
			);

			return this.resultOk((res.data as { story: ISbStoryData<Person> }).story);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Failed to fetch person: ${JSON.stringify(error)}`);
		}
	}

	async getArticlesByTag(tagId: string, lang: string): Promise<ServiceResult<ISbStoryData<ResolvedArticle>[]>> {
		try {
			const params: ISbStoriesParams = {
				...(await this.getStoryParams(lang)),
				per_page: StoryblokService.defaultPageSize,
				resolve_relations: StoryblokService.standardArticleRelationsToResolve,
				excluding_fields: StoryblokService.contentField,
				sort_by: 'first_published_at:desc',
				content_type: StoryblokService.contentType.article,
				filter_query: this.articleByTagsFilter(tagId),
			};
			const data = await getStoryblokApi().getAll(StoryblokService.storiesPath, params);

			return this.resultOk(data);
		} catch (error) {
			this.logger.error(error);

			return this.resultOk([]);
		}
	}

	async getArticlesByAuthor(authorId: string, lang: string): Promise<ServiceResult<ISbStoryData<ResolvedArticle>[]>> {
		try {
			const params: ISbStoriesParams = {
				...(await this.getStoryParams(lang)),
				per_page: StoryblokService.defaultPageSize,
				excluding_fields: StoryblokService.contentField,
				resolve_relations: StoryblokService.standardArticleRelationsToResolve,
				sort_by: 'first_published_at:desc',
				content_type: StoryblokService.contentType.article,
				filter_query: this.articlesByAuthorFilter(authorId),
			};
			const data = await getStoryblokApi().getAll(StoryblokService.storiesPath, params);

			return this.resultOk(data);
		} catch (error) {
			this.logger.error(error);

			return this.resultOk([]);
		}
	}

	async getOverviewArticles(
		lang: string,
		idsToIgnore?: string,
		limit?: number,
	): Promise<ServiceResult<ISbStoryData<ResolvedArticle>[]>> {
		try {
			const params: ISbStoriesParams = {
				...(await this.getStoryParams(lang)),
				per_page: limit ?? StoryblokService.defaultPageSize,
				excluding_fields: StoryblokService.contentField,
				resolve_relations: StoryblokService.standardArticleRelationsToResolve,
				sort_by: 'first_published_at:desc',
				content_type: StoryblokService.contentType.article,
				filter_query: { displayInOverviewPage: { is: true } },
				...(idsToIgnore ? { excluding_ids: idsToIgnore } : {}),
			};

			if (limit) {
				const res = await getStoryblokApi().get(StoryblokService.storiesPath, params);

				return this.resultOk((res.data as { stories: ISbStoryData<ResolvedArticle>[] }).stories);
			}

			const data = await getStoryblokApi().getAll(StoryblokService.storiesPath, params);

			return this.resultOk(data);
		} catch (error) {
			this.logger.error(error);

			return this.resultOk([]);
		}
	}

	async getArticlesByUuids(lang: string, articleUuids: string[]): Promise<ServiceResult<ISbStoryData<ResolvedArticle>[]>> {
		try {
			const uuids = [...new Set(articleUuids.filter(Boolean))];
			if (!uuids.length) {
				return this.resultOk([]);
			}

			const params: ISbStoriesParams = {
				...(await this.getStoryParams(lang)),
				per_page: uuids.length,
				excluding_fields: StoryblokService.contentField,
				resolve_relations: StoryblokService.standardArticleRelationsToResolve,
				content_type: StoryblokService.contentType.article,
			};
			(params as ISbStoriesParams & { by_uuids_ordered: string }).by_uuids_ordered = uuids.join(',');

			const res = await getStoryblokApi().get(StoryblokService.storiesPath, params);

			return this.resultOk((res.data as { stories: ISbStoryData<ResolvedArticle>[] }).stories);
		} catch (error) {
			this.logger.error(error);

			return this.resultOk([]);
		}
	}

	async getArticle(lang: string, slug: string): Promise<ServiceResult<ISbStoryData<ResolvedArticle>>> {
		try {
			const res = await this.withLanguageFallback(
				async (l, s) => {
					const params: ISbStoriesParams = {
						...(await this.getStoryParams(l)),
						resolve_relations: StoryblokService.standardArticleRelationsToResolve,
					};

					return getStoryblokApi().get(`cdn/stories/journal/${s}`, params);
				},
				lang,
				slug,
			);

			return this.resultOk((res.data as { story: ISbStoryData<ResolvedArticle> }).story);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Failed to fetch article: ${JSON.stringify(error)}`);
		}
	}

	async getRelativeArticles(
		authorId: string,
		articleId: number,
		tags: string[],
		lang: string,
		numberOfArticles: number,
	): Promise<ServiceResult<ISbStoryData<ResolvedArticle>[]>> {
		try {
			const related = await this.getRelativeArticlesByAuthorAndTags(authorId, tags, lang, articleId, numberOfArticles);
			let result = related.data.stories;

			if (result.length < numberOfArticles) {
				const idsToIgnore = [...result.map((s) => s.id), articleId].join(',');
				const remaining = numberOfArticles - result.length;
				const overview = await this.getOverviewArticles(lang, idsToIgnore, remaining);
				if (overview.success) {
					result = [...result, ...overview.data];
				}
			}

			return this.resultOk(result);
		} catch (error) {
			this.logger.error(error);

			return this.resultOk([]);
		}
	}

	private articleByTagsFilter(tagId: string) {
		return { tags: { any_in_array: tagId } };
	}

	private articlesByAuthorFilter(authorId: string) {
		return { author: { in: authorId } };
	}

	private createRelativeArticlesFilter(tags: string[], authorId: string) {
		return tags.length
			? { __or: [{ author: { in: authorId } }, { tags: { in_array: tags.join(',') } }] }
			: { author: { in: authorId } };
	}

	private async getRelativeArticlesByAuthorAndTags(
		authorId: string,
		tags: string[],
		lang: string,
		articleId: number,
		numberOfArticles: number,
	): Promise<ISbStories<ResolvedArticle>> {
		const filter = this.createRelativeArticlesFilter(tags, authorId);
		const params: ISbStoriesParams = {
			...(await this.getStoryParams(lang)),
			per_page: numberOfArticles,
			excluding_fields: StoryblokService.contentField,
			resolve_relations: StoryblokService.standardArticleRelationsToResolve,
			sort_by: 'first_published_at:desc',
			excluding_ids: articleId.toString(),
			content_type: StoryblokService.contentType.article,
			filter_query: filter,
		};

		return getStoryblokApi().get(StoryblokService.storiesPath, params);
	}
}

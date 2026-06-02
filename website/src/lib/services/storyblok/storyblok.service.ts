import type { CountryCode } from '@/generated/prisma/enums';
import type {
	Country,
	Faq,
	Focus,
	LocalPartner,
	Person,
	Program,
	Tag,
} from '@/generated/storyblok/types/109655/storyblok-components';
import { defaultLanguage } from '@/lib/i18n/utils';
import {
	STORYBLOK_COUNTRIES_FOLDER,
	STORYBLOK_FAQ_FOLDER,
	STORYBLOK_FOCUSES_FOLDER,
	STORYBLOK_LOCAL_PARTNERS_FOLDER,
	STORYBLOK_PROGRAMS_FOLDER,
	getJournalArticleStoryPath,
	getJournalTagStoryPath,
	getPersonStoryPath,
} from '@/lib/storyblok/storyblok-paths';
import type { ISbStories, ISbStoriesParams, ISbStoryData } from '@storyblok/js';
import { draftMode } from 'next/headers';
import { notFound } from 'next/navigation';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { getStoryblokApi } from './storyblok.config';
import type { ResolvedArticle } from './storyblok.utils';

export type StoryTitleData = {
	name?: string;
	content?: {
		component?: string;
		title?: string;
		isoCode?: number | string;
	};
};

export class StoryblokService extends BaseService {
	static readonly journalTeaserLimit = 3;

	private static readonly contentType = {
		article: 'article',
		country: 'Country',
		focus: 'Focus',
		localPartner: 'Local Partner',
		person: 'person',
		program: 'program',
		tag: 'tag',
	} as const;
	private static readonly standardArticleRelationsToResolve = ['article.author', 'article.tags', 'article.type'];
	private static readonly standardStoryRelationsToResolve = [
		'faqSelection.questions',
		'downloads.documents',
		'partnershipsCarousel.partnerships',
		'Country.partners',
		'Local Partner.focuses',
		'Local Partner.partners',
	];
	private static readonly countryRelationsToResolve = ['Country.partners'];
	private static readonly localPartnerRelationsToResolve = ['Local Partner.focuses', 'Local Partner.partners'];
	private static readonly defaultPageSize = 50;
	private static readonly contentField = 'content';
	private static readonly leadTextField = 'leadText';
	private static readonly storiesPath = 'cdn/stories';
	private static readonly countriesPath = STORYBLOK_COUNTRIES_FOLDER;
	private static readonly focusesPath = STORYBLOK_FOCUSES_FOLDER;
	private static readonly localPartnersPath = STORYBLOK_LOCAL_PARTNERS_FOLDER;
	private static readonly programsPath = STORYBLOK_PROGRAMS_FOLDER;
	private static readonly faqsPath = STORYBLOK_FAQ_FOLDER;
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

	private static isFaqStory(story: unknown): story is ISbStoryData<Faq> {
		if (!story || typeof story !== 'object' || !('content' in story)) {
			return false;
		}

		const storyWithContent = story as { content?: unknown };
		if (!storyWithContent.content || typeof storyWithContent.content !== 'object') {
			return false;
		}

		const contentWithComponent = storyWithContent.content as { component?: string };

		return contentWithComponent.component?.toLowerCase() === 'faq';
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

	private async withOptionalLanguageFallback<T>(
		loader: (lang: string, slug: string) => Promise<T>,
		lang: string,
		slug: string,
	): Promise<T | undefined> {
		try {
			return await loader(lang, slug);
		} catch (error: unknown) {
			const errorStatus = typeof error === 'object' && error !== null && 'status' in error ? error.status : undefined;
			if (errorStatus === 404) {
				if (lang === defaultLanguage) {
					return undefined;
				}

				return await this.withOptionalLanguageFallback(loader, defaultLanguage, slug);
			}
			throw error;
		}
	}

	async getStoryWithFallback<T>(slug: string, lang: string): Promise<ServiceResult<T>> {
		try {
			const data = await this.withLanguageFallback(
				async (language: string) => {
					const response = await getStoryblokApi().get(`cdn/stories/${slug}`, {
						...(await this.getStoryParams(language)),
						resolve_relations: StoryblokService.standardStoryRelationsToResolve,
					});
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

	async getStoryTitle(slug: string, lang: string): Promise<ServiceResult<StoryTitleData>> {
		try {
			const data = await this.withOptionalLanguageFallback(
				async (language: string) => {
					const response = await getStoryblokApi().get(`cdn/stories/${slug}`, await this.getStoryParams(language));
					const responseData = response.data as { story: StoryTitleData };

					return responseData.story;
				},
				lang,
				slug,
			);

			if (!data) {
				return this.resultFail('Story not found');
			}

			return this.resultOk(data);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Failed to fetch story title: ${JSON.stringify(error)}`);
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

	async resolveArticleCountInDefaultLanguage(
		lang: string,
		countInSelectedLanguage: number,
		fetchDefaultLanguageCount: () => Promise<ServiceResult<number>>,
	): Promise<number> {
		if (lang === defaultLanguage) {
			return countInSelectedLanguage;
		}

		const result = await fetchDefaultLanguageCount();

		return result.success ? result.data : countInSelectedLanguage;
	}

	async getPersonsByUuids(lang: string, personUuids: string[]): Promise<ServiceResult<ISbStoryData<Person>[]>> {
		try {
			const uuids = [...new Set(personUuids.map((u) => u.trim()).filter(Boolean))];
			if (!uuids.length) {
				return this.resultOk([]);
			}

			const params: ISbStoriesParams = {
				...(await this.getStoryParams(lang)),
				per_page: uuids.length,
				content_type: StoryblokService.contentType.person,
			};
			(params as ISbStoriesParams & { by_uuids_ordered: string }).by_uuids_ordered = uuids.join(',');
			const res = await getStoryblokApi().get(StoryblokService.storiesPath, params);

			return this.resultOk((res.data as { stories: ISbStoryData<Person>[] }).stories);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Failed to fetch persons by UUIDs: ${JSON.stringify(error)}`);
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

	async getPersonsByCountryOffice(lang: string, isoCode: string): Promise<ServiceResult<ISbStoryData<Person>[]>> {
		try {
			const countryOfficeCode = isoCode?.trim() ?? '';
			if (!countryOfficeCode) {
				return this.resultOk([]);
			}

			const params: ISbStoriesParams = {
				...(await this.getStoryParams(lang)),
				content_type: StoryblokService.contentType.person,
				filter_query: { countryOffice: { any_in_array: countryOfficeCode } },
			};
			const data = await getStoryblokApi().getAll(StoryblokService.storiesPath, params);

			return this.resultOk(data);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Failed to fetch persons by country office: ${JSON.stringify(error)}`);
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
				async (l, s) => getStoryblokApi().get(`cdn/stories/${getJournalTagStoryPath(s)}`, await this.getStoryParams(l)),
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
				resolve_relations: StoryblokService.countryRelationsToResolve,
			};
			const data = await getStoryblokApi().getAll(StoryblokService.storiesPath, params);
			let countries = data.filter((story) => StoryblokService.isCountryStory(story));

			if (countries.length === 0 && StoryblokService.shouldFallbackToDraft(baseParams.version)) {
				const draftParams: ISbStoriesParams = {
					...baseParams,
					version: 'draft',
					starts_with: `${StoryblokService.countriesPath}/`,
					resolve_relations: StoryblokService.countryRelationsToResolve,
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

	async getCountryPrograms(lang: string, isoCode: string): Promise<ServiceResult<ISbStoryData<Program>[]>> {
		try {
			const normalizedIsoCode = isoCode.trim().toUpperCase();
			if (!normalizedIsoCode) {
				return this.resultOk([]);
			}

			const programsResult = await this.getPrograms(lang);
			if (!programsResult.success) {
				return this.resultOk([]);
			}

			const programsInCountry = await this.db.program.findMany({
				where: { country: { isoCode: normalizedIsoCode as CountryCode } },
				select: { id: true },
			});
			const programIdsInCountry = new Set(programsInCountry.map((program) => program.id));

			const countryPrograms = programsResult.data.filter((story) => {
				const programId = story.content?.id?.toString().trim();
				if (!programId) {
					return false;
				}

				return programIdsInCountry.has(programId);
			});

			return this.resultOk(countryPrograms);
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

	async getFaqs(lang: string, limit = 5): Promise<ServiceResult<ISbStoryData<Faq>[]>> {
		try {
			const baseParams = await this.getStoryParams(lang);
			const params: ISbStoriesParams = {
				...baseParams,
				starts_with: `${StoryblokService.faqsPath}/`,
			};
			const data = await getStoryblokApi().getAll(StoryblokService.storiesPath, params);
			let faqs = data.filter((story) => StoryblokService.isFaqStory(story));

			if (faqs.length === 0 && StoryblokService.shouldFallbackToDraft(baseParams.version)) {
				const draftParams: ISbStoriesParams = {
					...baseParams,
					version: 'draft',
					starts_with: `${StoryblokService.faqsPath}/`,
				};
				const draftData = await getStoryblokApi().getAll(StoryblokService.storiesPath, draftParams);
				faqs = draftData.filter((story) => StoryblokService.isFaqStory(story));
			}

			const sortedFaqs = [...faqs].sort((left, right) => (left.position ?? 0) - (right.position ?? 0));

			return this.resultOk(sortedFaqs.slice(0, limit));
		} catch (error) {
			this.logger.error(error);

			return this.resultOk([]);
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

	async getCountryByIsoCode(isoCode: string, lang: string): Promise<ServiceResult<ISbStoryData<Country>>> {
		const normalizedIsoCode = isoCode.trim();
		const loadCountry = async (language: string) => {
			const countries = await this.getCountries(language);
			if (!countries.success) {
				return undefined;
			}

			return countries.data.find((country) => country.content.isoCode?.toString().trim() === normalizedIsoCode);
		};

		try {
			let story = await loadCountry(lang);
			if (!story && lang !== defaultLanguage) {
				story = await loadCountry(defaultLanguage);
			}

			if (!story) {
				return this.resultFail(`Failed to fetch country: not found for isoCode '${isoCode}'`);
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
				resolve_relations: StoryblokService.localPartnerRelationsToResolve,
			};
			const data = await getStoryblokApi().getAll(StoryblokService.storiesPath, params);
			let localPartners = data.filter((story) => StoryblokService.isLocalPartnerStory(story));

			if (localPartners.length === 0 && StoryblokService.shouldFallbackToDraft(baseParams.version)) {
				const draftParams: ISbStoriesParams = {
					...baseParams,
					version: 'draft',
					starts_with: `${StoryblokService.localPartnersPath}/`,
					resolve_relations: StoryblokService.localPartnerRelationsToResolve,
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
				const contentSlug = focus.content.portalSlug?.trim();

				return focus.slug === normalizedSlug || fullSlugTail === normalizedSlug || contentSlug === normalizedSlug;
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
				async (l, s) => getStoryblokApi().get(`cdn/stories/${getPersonStoryPath(s)}`, await this.getStoryParams(l)),
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

	async getLatestJournalArticles(lang: string, limit = StoryblokService.journalTeaserLimit) {
		const result = await this.getOverviewArticles(lang, undefined, limit);

		return this.resultOk(result.success ? result.data.slice(0, limit) : []);
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

					return getStoryblokApi().get(`cdn/stories/${getJournalArticleStoryPath(s)}`, params);
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

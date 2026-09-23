import { defaultLanguage } from '@/lib/i18n/utils';
import { resultFail, resultOk, type ServiceResult } from '@/lib/service-result';
import { getWebsitePublicPath } from '@/lib/storyblok/storyblok-paths';
import {
	createWebsiteJournalArticleLink,
	createWebsiteJournalArticleTypeLink,
	createWebsiteJournalPath,
	createWebsiteJournalTagLink,
	createWebsitePersonLink,
	getArticleTitle,
	getArticleTypeLabel,
	getPersonDisplayName,
} from '@/lib/storyblok/storyblok-utils';
import * as storyblokContent from '@/modules/storyblok-content/storyblok-content.service';
import type { ISbStoryData } from '@storyblok/js';
import type {
	JournalArticle,
	JournalArticlePageData,
	JournalBreadcrumbLink,
	JournalOverviewPageData,
	JournalOverviewRequest,
	JournalPageRequest,
	JournalPerson,
	JournalPersonPageData,
} from './journal.types';

const JOURNAL_RELATED_ARTICLES_COUNT = 3;

export const getJournalOverviewPageData = async (
	request: JournalOverviewRequest,
): Promise<ServiceResult<JournalOverviewPageData>> => {
	try {
		const { lang, region, labels, filter } = request;
		const journalPath = createWebsiteJournalPath(lang, region);
		const pathname = buildJournalOverviewPathname(journalPath, filter);
		const [authorsResult, articleTypesResult, roleLabelsResult] = await Promise.all([
			storyblokContent.getOverviewAuthors(lang),
			storyblokContent.getOverviewArticleTypes(lang),
			storyblokContent.getPrimaryRoleLabels(lang),
		]);
		const authors = authorsResult.success ? authorsResult.data : [];
		const articleTypes = articleTypesResult.success ? articleTypesResult.data : [];
		const roleLabels = roleLabelsResult.success ? roleLabelsResult.data : {};

		if (filter?.tagSlug) {
			const tagResult = await storyblokContent.getTag(filter.tagSlug, lang);
			if (!tagResult.success) {
				return resultFail('Journal tag not found', tagResult.status);
			}
			const articlesResult = await storyblokContent.getArticlesByTag(tagResult.data.uuid, lang);
			const articles = articlesResult.success ? articlesResult.data : [];
			const totalInDefault = await getDefaultLanguageCount(lang, articles.length, () =>
				storyblokContent.getArticleCountByTagForDefaultLang(tagResult.data.uuid),
			);

			return resultOk({
				articles,
				authors,
				articleTypes,
				showMoreArticlesLink: totalInDefault > articles.length,
				pageTitle: tagResult.data.content.value,
				pageDescription: tagResult.data.content.description?.trim(),
				activeTagSlug: filter.tagSlug,
				journalPath,
				pathname,
				breadcrumbs: buildJournalOverviewBreadcrumbs(labels, journalPath, lang, region, {
					label: tagResult.data.content.value,
					href: createWebsiteJournalTagLink(filter.tagSlug, lang, region),
				}),
				roleLabels,
			});
		}

		if (filter?.articleTypeSlug) {
			const articleTypeResult = await storyblokContent.getArticleType(filter.articleTypeSlug, lang);
			if (!articleTypeResult.success) {
				return resultFail('Journal article type not found', articleTypeResult.status);
			}
			const articleType = articleTypeResult.data;
			const articlesResult = await storyblokContent.getArticlesByArticleType(articleType.uuid, lang);
			const articles = articlesResult.success ? articlesResult.data : [];
			const totalInDefault = await getDefaultLanguageCount(lang, articles.length, () =>
				storyblokContent.getArticleCountByArticleTypeForDefaultLang(articleType.uuid),
			);
			const articleTypeLabel = getArticleTypeLabel(articleType);

			return resultOk({
				articles,
				authors,
				articleTypes,
				showMoreArticlesLink: totalInDefault > articles.length,
				pageTitle: articleTypeLabel,
				pageDescription: articleType.content.description?.trim(),
				activeArticleTypeSlug: filter.articleTypeSlug,
				journalPath,
				pathname,
				breadcrumbs: buildJournalOverviewBreadcrumbs(labels, journalPath, lang, region, {
					label: articleTypeLabel,
					href: createWebsiteJournalArticleTypeLink(filter.articleTypeSlug, lang, region),
				}),
				roleLabels,
			});
		}

		const articlesResult = await storyblokContent.getOverviewArticles(lang);
		const articles = articlesResult.success ? articlesResult.data : [];
		const totalInDefault = await getDefaultLanguageCount(lang, articles.length, () =>
			storyblokContent.getOverviewArticlesCountForDefaultLang(),
		);

		return resultOk({
			articles,
			authors,
			articleTypes,
			showMoreArticlesLink: totalInDefault > articles.length,
			pageTitle: labels.overviewTitle,
			pageDescription: labels.overviewDescription,
			journalPath,
			pathname,
			breadcrumbs: buildJournalOverviewBreadcrumbs(labels, journalPath, lang, region),
			roleLabels,
		});
	} catch (error) {
		console.error('Could not load journal overview', { error });

		return resultFail('Could not load journal overview');
	}
};

export const getJournalArticlePageData = async (
	request: JournalPageRequest,
): Promise<ServiceResult<JournalArticlePageData>> => {
	try {
		const { lang, region, slug, journalLabel, homeLabel } = request;
		const articleResult = await storyblokContent.getArticle(lang, slug);
		if (!articleResult.success) {
			return resultFail('Journal article not found', articleResult.status);
		}
		const story = articleResult.data;
		const relatedResult = await storyblokContent.getRelativeArticles(
			story.content.author.uuid,
			story.id,
			story.content.tags?.map((tag) => tag.uuid) ?? [],
			lang,
			JOURNAL_RELATED_ARTICLES_COUNT,
		);
		const journalPath = createWebsiteJournalPath(lang, region);

		return resultOk({
			story,
			relatedArticles: relatedResult.success ? relatedResult.data : [],
			breadcrumbs: buildJournalArticleBreadcrumbs(
				homeLabel,
				journalLabel,
				journalPath,
				getArticleTitle(story, true),
				createWebsiteJournalArticleLink(slug, lang, region),
				lang,
				region,
			),
		});
	} catch (error) {
		console.error('Could not load journal article', { error });

		return resultFail('Could not load journal article');
	}
};

export const getJournalPersonPageData = async (
	request: JournalPageRequest,
): Promise<ServiceResult<JournalPersonPageData>> => {
	try {
		const { lang, region, slug, journalLabel, homeLabel } = request;
		const personResult = await storyblokContent.getPerson(slug, lang);
		if (!personResult.success) {
			return resultFail('Journal person not found', personResult.status);
		}
		const person = personResult.data;
		const [articlesResult, roleLabelsResult] = await Promise.all([
			storyblokContent.getArticlesByAuthor(person.uuid, lang),
			storyblokContent.getPrimaryRoleLabels(lang),
		]);
		const articles = articlesResult.success ? articlesResult.data : [];
		const roleLabels = roleLabelsResult.success ? roleLabelsResult.data : {};
		const totalInDefault = await getDefaultLanguageCount(lang, articles.length, () =>
			storyblokContent.getArticleCountByAuthorForDefaultLang(person.uuid),
		);
		const pathname = createWebsitePersonLink(slug, lang, region);
		const journalPath = createWebsiteJournalPath(lang, region);

		return resultOk({
			person,
			articles,
			showMoreArticlesLink: totalInDefault > articles.length,
			pathname,
			breadcrumbs: buildJournalPersonBreadcrumbs(
				homeLabel,
				journalLabel,
				journalPath,
				getPersonDisplayName(person),
				pathname,
				lang,
				region,
			),
			roleLabels,
		});
	} catch (error) {
		console.error('Could not load journal person', { error });

		return resultFail('Could not load journal person');
	}
};

export const getJournalArticle = async (
	language: string,
	slug: string,
): Promise<ServiceResult<ISbStoryData<JournalArticle>>> => {
	try {
		const result = await storyblokContent.getArticle(language, slug);

		return result.success ? result : resultFail('Journal article not found', result.status);
	} catch (error) {
		console.error('Could not load journal article', { error });

		return resultFail('Could not load journal article');
	}
};

export const getJournalPerson = async (
	language: string,
	slug: string,
): Promise<ServiceResult<ISbStoryData<JournalPerson>>> => {
	try {
		const result = await storyblokContent.getPerson(slug, language);

		return result.success ? result : resultFail('Journal person not found', result.status);
	} catch (error) {
		console.error('Could not load journal person', { error });

		return resultFail('Could not load journal person');
	}
};

export const getLatestJournalArticles = async (language: string): Promise<ServiceResult<ISbStoryData<JournalArticle>[]>> => {
	try {
		const result = await storyblokContent.getLatestJournalArticles(language);

		return result.success ? result : resultFail('Could not load journal articles', result.status);
	} catch (error) {
		console.error('Could not load journal articles', { error });

		return resultFail('Could not load journal articles');
	}
};

export const getJournalArticlesByUuids = async (
	language: string,
	articleUuids: string[],
): Promise<ServiceResult<ISbStoryData<JournalArticle>[]>> => {
	try {
		const result = await storyblokContent.getArticlesByUuids(language, articleUuids);

		return result.success ? result : resultFail('Could not load journal articles', result.status);
	} catch (error) {
		console.error('Could not load journal articles', { error });

		return resultFail('Could not load journal articles');
	}
};

const getDefaultLanguageCount = async (
	language: string,
	selectedLanguageCount: number,
	getDefaultLanguageResult: () => Promise<ServiceResult<number>>,
): Promise<number> => {
	if (language === defaultLanguage) {
		return selectedLanguageCount;
	}
	const result = await getDefaultLanguageResult();

	return result.success ? result.data : selectedLanguageCount;
};

const buildJournalOverviewPathname = (journalPath: string, filter: JournalOverviewRequest['filter']): string => {
	if (filter?.tagSlug) {
		return `${journalPath}?tag=${encodeURIComponent(filter.tagSlug)}`;
	}
	if (filter?.articleTypeSlug) {
		return `${journalPath}?type=${encodeURIComponent(filter.articleTypeSlug)}`;
	}

	return journalPath;
};

const buildHomeBreadcrumb = (homeLabel: string, lang: string, region: string): JournalBreadcrumbLink => ({
	label: homeLabel,
	href: getWebsitePublicPath(lang, region, ''),
});

const buildJournalOverviewBreadcrumbs = (
	labels: JournalOverviewRequest['labels'],
	journalPath: string,
	lang: string,
	region: string,
	activeFilter?: JournalBreadcrumbLink,
): JournalBreadcrumbLink[] => {
	const breadcrumbs = [
		buildHomeBreadcrumb(labels.homeLabel, lang, region),
		{ label: labels.journalLabel, href: journalPath },
	];

	return activeFilter ? [...breadcrumbs, activeFilter] : breadcrumbs;
};

const buildJournalArticleBreadcrumbs = (
	homeLabel: string,
	journalLabel: string,
	journalPath: string,
	articleTitle: string,
	articleHref: string,
	lang: string,
	region: string,
): JournalBreadcrumbLink[] => [
	buildHomeBreadcrumb(homeLabel, lang, region),
	{ label: journalLabel, href: journalPath },
	{ label: articleTitle, href: articleHref },
];

const buildJournalPersonBreadcrumbs = (
	homeLabel: string,
	journalLabel: string,
	journalPath: string,
	personName: string,
	personHref: string,
	lang: string,
	region: string,
): JournalBreadcrumbLink[] => [
	buildHomeBreadcrumb(homeLabel, lang, region),
	{ label: journalLabel, href: journalPath },
	{ label: personName, href: personHref },
];

import type { Person } from '@/generated/storyblok/types/109655/storyblok-components';
import { defaultLanguage, type WebsiteCurrency } from '@/lib/i18n/utils';
import { resultFail, resultOk, type Result } from '@/lib/result';
import type { JournalRssArticle } from '@/lib/storyblok/journal-rss';
import { getWebsitePublicPath } from '@/lib/storyblok/storyblok-paths';
import {
	createWebsiteJournalArticleLink,
	createWebsiteJournalArticleTypeLink,
	createWebsiteJournalPath,
	createWebsiteJournalTagLink,
	createWebsitePeoplePath,
	createWebsitePersonLink,
	getArticleTitle,
	getArticleTypeLabel,
	getPersonAvatarSrc,
	getPersonDisplayName,
	toStringArray,
} from '@/lib/storyblok/storyblok-utils';
import * as community from '@/modules/community/community.cache';
import * as storyblokContent from '@/modules/storyblok-content/storyblok-content.cache';
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
const OTHER_PERSONS_COUNT = 8;

// Active volunteers with a portrait, those sharing a circle with the person first
const pickOtherPersons = (person: ISbStoryData<Person>, persons: ISbStoryData<Person>[]) => {
	const circles = new Set(toStringArray(person.content.activeCircleMember));
	const candidates = persons.filter(
		(other) => other.uuid !== person.uuid && other.content.volunteerStatus === 'active' && getPersonAvatarSrc(other),
	);
	const sharesCircle = (other: ISbStoryData<Person>) =>
		toStringArray(other.content.activeCircleMember).some((circle) => circles.has(circle));

	return [...candidates.filter(sharesCircle), ...candidates.filter((other) => !sharesCircle(other))].slice(
		0,
		OTHER_PERSONS_COUNT,
	);
};

export const getJournalOverviewPageData = async (
	request: JournalOverviewRequest,
): Promise<Result<JournalOverviewPageData>> => {
	try {
		const { lang, currency, labels, filter } = request;
		const journalPath = createWebsiteJournalPath(lang, currency);
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
				breadcrumbs: buildJournalOverviewBreadcrumbs(labels, journalPath, lang, currency, {
					label: tagResult.data.content.value,
					href: createWebsiteJournalTagLink(filter.tagSlug, lang, currency),
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
				breadcrumbs: buildJournalOverviewBreadcrumbs(labels, journalPath, lang, currency, {
					label: articleTypeLabel,
					href: createWebsiteJournalArticleTypeLink(filter.articleTypeSlug, lang, currency),
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
			breadcrumbs: buildJournalOverviewBreadcrumbs(labels, journalPath, lang, currency),
			roleLabels,
		});
	} catch (error) {
		console.error('Could not load journal overview', { error });

		return resultFail('Could not load journal overview');
	}
};

export const getJournalArticlePageData = async (request: JournalPageRequest): Promise<Result<JournalArticlePageData>> => {
	try {
		const { lang, currency, slug, parentLabel, homeLabel } = request;
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
		const journalPath = createWebsiteJournalPath(lang, currency);

		return resultOk({
			story,
			relatedArticles: relatedResult.success ? relatedResult.data : [],
			breadcrumbs: buildJournalArticleBreadcrumbs(
				homeLabel,
				parentLabel,
				journalPath,
				getArticleTitle(story),
				createWebsiteJournalArticleLink(slug, lang, currency),
				lang,
				currency,
			),
		});
	} catch (error) {
		console.error('Could not load journal article', { error });

		return resultFail('Could not load journal article');
	}
};

export const getJournalPersonPageData = async (request: JournalPageRequest): Promise<Result<JournalPersonPageData>> => {
	try {
		const { lang, currency, slug, parentLabel, homeLabel } = request;
		const personResult = await storyblokContent.getPerson(slug, lang);
		if (!personResult.success) {
			return resultFail('Journal person not found', personResult.status);
		}
		const person = personResult.data;
		const [
			articlesResult,
			roleLabelsResult,
			circleLabelsResult,
			timeCommitmentLabelsResult,
			workStyleLabelsResult,
			personsResult,
			contributionsResult,
		] = await Promise.all([
			storyblokContent.getArticlesByAuthor(person.uuid, lang),
			storyblokContent.getPrimaryRoleLabels(lang),
			storyblokContent.getCircleLabels(lang),
			storyblokContent.getTimeCommitmentLabels(lang),
			storyblokContent.getWorkStyleLabels(lang),
			storyblokContent.getAllPersons(lang),
			community.getPersonContributions(person.uuid, lang, currency),
		]);
		const articles = articlesResult.success ? articlesResult.data : [];
		const roleLabels = roleLabelsResult.success ? roleLabelsResult.data : {};
		const circleLabels = circleLabelsResult.success ? circleLabelsResult.data : {};
		const timeCommitmentLabels = timeCommitmentLabelsResult.success ? timeCommitmentLabelsResult.data : {};
		const workStyleLabels = workStyleLabelsResult.success ? workStyleLabelsResult.data : {};
		const totalInDefault = await getDefaultLanguageCount(lang, articles.length, () =>
			storyblokContent.getArticleCountByAuthorForDefaultLang(person.uuid),
		);
		const pathname = createWebsitePersonLink(slug, lang, currency);
		const peoplePath = createWebsitePeoplePath(lang, currency);

		return resultOk({
			person,
			articles,
			showMoreArticlesLink: totalInDefault > articles.length,
			pathname,
			breadcrumbs: buildJournalPersonBreadcrumbs(
				homeLabel,
				parentLabel,
				peoplePath,
				getPersonDisplayName(person),
				pathname,
				lang,
				currency,
			),
			roleLabels,
			circleLabels,
			timeCommitmentLabels,
			workStyleLabels,
			contributions: contributionsResult.success ? contributionsResult.data : [],
			otherPersons: personsResult.success ? pickOtherPersons(person, personsResult.data) : [],
		});
	} catch (error) {
		console.error('Could not load journal person', { error });

		return resultFail('Could not load journal person');
	}
};

export const getJournalArticle = async (language: string, slug: string): Promise<Result<ISbStoryData<JournalArticle>>> => {
	try {
		const result = await storyblokContent.getArticle(language, slug);

		return result.success ? result : resultFail('Journal article not found', result.status);
	} catch (error) {
		console.error('Could not load journal article', { error });

		return resultFail('Could not load journal article');
	}
};

export const getJournalPerson = async (language: string, slug: string): Promise<Result<ISbStoryData<JournalPerson>>> => {
	try {
		const result = await storyblokContent.getPerson(slug, language);

		return result.success ? result : resultFail('Journal person not found', result.status);
	} catch (error) {
		console.error('Could not load journal person', { error });

		return resultFail('Could not load journal person');
	}
};

export const getLatestJournalArticles = async (language: string): Promise<Result<ISbStoryData<JournalArticle>[]>> => {
	try {
		const result = await storyblokContent.getLatestJournalArticles(language);

		return result.success ? result : resultFail('Could not load journal articles', result.status);
	} catch (error) {
		console.error('Could not load journal articles', { error });

		return resultFail('Could not load journal articles');
	}
};

export const getPublishedJournalArticles = async (language: string): Promise<Result<JournalRssArticle[]>> => {
	try {
		const result = await storyblokContent.getPublishedJournalArticles(language);

		return result.success ? result : resultFail('Could not load journal articles', result.status);
	} catch (error) {
		console.error('Could not load published journal articles', { error });

		return resultFail('Could not load journal articles');
	}
};

export const getJournalArticlesByUuids = async (
	language: string,
	articleUuids: string[],
): Promise<Result<ISbStoryData<JournalArticle>[]>> => {
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
	getDefaultLanguageResult: () => Promise<Result<number>>,
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

const buildHomeBreadcrumb = (homeLabel: string, lang: string, currency: WebsiteCurrency): JournalBreadcrumbLink => ({
	label: homeLabel,
	href: getWebsitePublicPath(lang, currency, ''),
});

const buildJournalOverviewBreadcrumbs = (
	labels: JournalOverviewRequest['labels'],
	journalPath: string,
	lang: string,
	currency: WebsiteCurrency,
	activeFilter?: JournalBreadcrumbLink,
): JournalBreadcrumbLink[] => {
	const breadcrumbs = [
		buildHomeBreadcrumb(labels.homeLabel, lang, currency),
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
	currency: WebsiteCurrency,
): JournalBreadcrumbLink[] => [
	buildHomeBreadcrumb(homeLabel, lang, currency),
	{ label: journalLabel, href: journalPath },
	{ label: articleTitle, href: articleHref },
];

// A person page sits under the people overview, not under the journal
const buildJournalPersonBreadcrumbs = (
	homeLabel: string,
	peopleLabel: string,
	peoplePath: string,
	personName: string,
	personHref: string,
	lang: string,
	currency: WebsiteCurrency,
): JournalBreadcrumbLink[] => [
	buildHomeBreadcrumb(homeLabel, lang, currency),
	{ label: peopleLabel, href: peoplePath },
	{ label: personName, href: personHref },
];

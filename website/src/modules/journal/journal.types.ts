import type { ArticleType, Person } from '@/generated/storyblok/types/109655/storyblok-components';
import type { ResolvedArticle } from '@/modules/storyblok-content/storyblok-content.types';
import type { ISbStoryData } from '@storyblok/js';

export type JournalArticle = ResolvedArticle;
export type JournalPerson = Person;

export type JournalBreadcrumbLink = {
	label: string;
	href: string;
};

type JournalOverviewFilter = {
	tagSlug?: string;
	articleTypeSlug?: string;
};

type JournalOverviewLabels = {
	homeLabel: string;
	journalLabel: string;
	overviewTitle: string;
	overviewDescription: string;
};

export type JournalOverviewRequest = {
	lang: string;
	region: string;
	labels: JournalOverviewLabels;
	filter?: JournalOverviewFilter;
};

export type JournalPageRequest = {
	lang: string;
	region: string;
	slug: string;
	journalLabel: string;
	homeLabel: string;
};

export type JournalOverviewPageData = {
	articles: ISbStoryData<JournalArticle>[];
	authors: ISbStoryData<Person>[];
	articleTypes: ISbStoryData<ArticleType>[];
	showMoreArticlesLink: boolean;
	pageTitle: string;
	pageDescription?: string;
	activeTagSlug?: string;
	activeArticleTypeSlug?: string;
	journalPath: string;
	pathname: string;
	breadcrumbs: JournalBreadcrumbLink[];
	roleLabels: Record<string, string>;
};

export type JournalArticlePageData = {
	story: ISbStoryData<JournalArticle>;
	relatedArticles: ISbStoryData<JournalArticle>[];
	breadcrumbs: JournalBreadcrumbLink[];
};

export type JournalPersonPageData = {
	person: ISbStoryData<Person>;
	articles: ISbStoryData<JournalArticle>[];
	showMoreArticlesLink: boolean;
	pathname: string;
	breadcrumbs: JournalBreadcrumbLink[];
	roleLabels: Record<string, string>;
};

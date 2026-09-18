import type { BreadcrumbLinkType } from '@/components/breadcrumb/breadcrumb';
import type { ArticleType, Person } from '@/generated/storyblok/types/109655/storyblok-components';
import type { ResolvedArticle } from '@/lib/services/storyblok/storyblok.utils';
import type { ISbStoryData } from '@storyblok/js';

export type JournalOverviewFilter = {
	tagSlug?: string;
	articleTypeSlug?: string;
};

export type JournalOverviewPageData = {
	articles: ISbStoryData<ResolvedArticle>[];
	authors: ISbStoryData<Person>[];
	articleTypes: ISbStoryData<ArticleType>[];
	showMoreArticlesLink: boolean;
	pageTitle: string;
	pageDescription?: string;
	activeTagSlug?: string;
	activeArticleTypeSlug?: string;
	journalPath: string;
	pathname: string;
	breadcrumbs: BreadcrumbLinkType[];
	roleLabels: Record<string, string>;
};

export type JournalArticlePageData = {
	story: ISbStoryData<ResolvedArticle>;
	relatedArticles: ISbStoryData<ResolvedArticle>[];
	breadcrumbs: BreadcrumbLinkType[];
};

export type JournalPersonPageData = {
	person: ISbStoryData<Person>;
	articles: ISbStoryData<ResolvedArticle>[];
	showMoreArticlesLink: boolean;
	pathname: string;
	breadcrumbs: BreadcrumbLinkType[];
	roleLabels: Record<string, string>;
};

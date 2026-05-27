import type { BreadcrumbLinkType } from '@/components/breadcrumb/breadcrumb';
import type { Person, Tag } from '@/generated/storyblok/types/109655/storyblok-components';
import type { ResolvedArticle } from '@/lib/services/storyblok/storyblok.utils';
import type { ISbStoryData } from '@storyblok/js';

export type JournalOverviewPageData = {
	articles: ISbStoryData<ResolvedArticle>[];
	authors: ISbStoryData<Person>[];
	tags: ISbStoryData<Tag>[];
	showMoreArticlesLink: boolean;
	pageTitle: string;
	pageDescription?: string;
	activeTagSlug?: string;
	journalPath: string;
	pathname: string;
	breadcrumbs: BreadcrumbLinkType[];
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
};

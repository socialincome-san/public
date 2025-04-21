import { ISbStoryData } from 'storyblok-js-client/src/interfaces';

export enum StoryblokContentType {
	Article = 'article',
	Author = 'author',
	Tag = 'topic',
}

export interface StoryblokImage {
	alt: string;
	filename: string;
	id: number;
}

export interface StoryblokArticleType {
	id: number;
	value: string;
}

export interface StoryblokTag {
	id: number;
	value: string;
	description: string;
	displayInOverviewPage: boolean;
}

export interface StoryblokAuthor {
	avatar: StoryblokImage;
	fullName: string;
	id: number;
	firstName: string;
	lastName: string;
	displayInOverviewPage: boolean;
	bio: string;
}

export interface StoryblokArticle {
	id: number;
	title: string;
	content: any;
	subtitle: string;
	type: ISbStoryData<StoryblokArticleType>;
	image: StoryblokImage;
	tags: ISbStoryData<StoryblokTag>[];
	author: ISbStoryData<StoryblokAuthor>;
	displayInOverviewPage: boolean;
	leadText: string;
	showRelativeArticles: boolean;
}

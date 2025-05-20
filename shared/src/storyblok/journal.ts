import { ISbStoryData } from 'storyblok-js-client/src/interfaces';

export enum StoryblokContentType {
	Article = 'article',
	Author = 'author',
	Tag = 'topic',
}

export interface StoryblokEmbeddedVideo {
	id: number;
	url?: string;
	caption: string;
	muxPlaybackId?: string;
}

export interface ReferencesGroup {
	context: string;
	references: ReferenceArticle[];
}

export interface ReferenceArticle {
	id: number;
	_uid: string;
	publicationDate: string;
	title: string;
	author: string;
	thumbnail?: StoryblokImage;
	mediaOutlet: string;
	url: string;
}

export interface StoryblokImage {
	alt: string;
	filename: string;
	focus?: string;
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

export interface ActionButton {
	text: string;
	url: string;
	primaryStyle: boolean;
	id: number;
	_uid: string;
	glowEffect: boolean;
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
	originalLanguage?: string;
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

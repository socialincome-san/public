import { ISbStoryData } from 'storyblok-js-client/src/interfaces';

export interface StoryblokImage {
	alt: string;
	filename: string;
	id: number;
}

export interface StoryblokTopic {
	id: number;
	value: string;
}

export interface StoryblokAuthor {
	avatar: StoryblokImage;
	fullName: string;
	id: number;
	firstName: string;
	lastName: string;
	displayInOverviewPage: boolean;
}

export interface StoryblokArticle {
	id: number;
	default_full_slug: string;
	title: string;
	content: any;
	subtitle: string;
	image: StoryblokImage;
	topics: ISbStoryData<StoryblokTopic>[];
	author: ISbStoryData<StoryblokAuthor>;
	displayInOverviewPage: boolean;
	leadText: string;
}

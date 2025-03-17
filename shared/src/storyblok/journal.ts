import { ISbStoryData } from 'storyblok-js-client/src/interfaces';

export interface StoryblokImage {
	alt: string;
	filename: string;
}

export interface StoryblokTopic {
	value: string;
}

export interface StoryblokAuthor {
	avatar: StoryblokImage;
	fullName: string;
}

export interface StoryblokArticle {
	default_full_slug: string;
	title: string;
	content: any;
	subtitle: string;
	image: StoryblokImage;
	topics: ISbStoryData<StoryblokTopic>[];
	author: ISbStoryData<StoryblokAuthor>;
}

import { ISbStoryData } from 'storyblok-js-client/src/interfaces';

export interface StoryBlokImage {
	alt: string;
	filename: string;
}

export interface StoryBlokTopic {
	value: string;
}

export interface StoryBlokAuthor {

	avatar: StoryBlokImage;
	fullName: string;

}

export interface StoryBlokArticle {
	default_full_slug: string;
	title: string;
	content: any;
	subtitle: string;
	image: StoryBlokImage;
	topics: ISbStoryData<StoryBlokTopic>[];
	author: ISbStoryData<StoryBlokAuthor>;
}

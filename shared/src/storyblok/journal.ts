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

export interface StoryblokQuotedText {
	text: string;
	author: string;
	id: number;
	uuid: string;
}

export interface StoryblokArticle {
	id: number;
	default_full_slug: string;
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

export interface StoryblokImageWithCaption {
	component: 'Add image';
	image: StoryblokImage;
	caption: string;
	_uid: string;
}

export interface StoryblokVideoEmbed {
	component: 'Embed video';
	url_youtube: {
		url: string;
	};
	video_caption?: string;
	_uid: string;
}

export interface StoryblokReferencedLink {
	_uid: string;
	component: 'referenced_link';
	source_url: { url: string };
	source_date: string;
	source_author: string;
}

export interface StoryblokLinksCard {
	component: 'Add links';
	reference_context: 'no_context' | 'reference_related' | 'reference_original';
	single_link: StoryblokReferencedLink[];
	_uid: string;
}

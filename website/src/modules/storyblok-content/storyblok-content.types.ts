import type { Article, ArticleType, Person, Tag } from '@/generated/storyblok/types/109655/storyblok-components';
import type { ISbStoryData } from '@storyblok/js';

type RemoveIndexSignature<T> = {
	[K in keyof T as string extends K ? never : K]: T[K];
};

export type ResolvedArticle = Omit<RemoveIndexSignature<Article>, 'author' | 'type' | 'tags'> & {
	author: ISbStoryData<Person>;
	type: ISbStoryData<ArticleType>;
	tags?: ISbStoryData<Tag>[];
};

export type StoryTitleData = {
	name?: string;
	content?: {
		component?: string;
		title?: string;
		isoCode?: number | string;
	};
};

export type StoryblokPublishedLink = {
	uuid: string;
	slug: string;
	is_folder: boolean;
	published: boolean;
	alternates?: {
		lang: string;
		path: string;
		name: string | null;
		published: boolean | null;
		translated_slug: string;
	}[];
};

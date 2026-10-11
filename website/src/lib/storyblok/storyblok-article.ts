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

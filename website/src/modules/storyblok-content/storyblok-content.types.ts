export type { ResolvedArticle } from '@/lib/storyblok/storyblok-article';

export type StoryTitleData = {
	name?: string;
	translated_slugs?: unknown[] | null;
	content?: {
		component?: string;
		title?: string;
		isoCode?: number | string;
	};
};

export type StoryblokPublishedLink = {
	uuid: string;
	slug: string;
	name?: string;
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

export const STORYBLOK_CACHE_TAG = 'storyblok';

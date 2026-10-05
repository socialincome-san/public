export type { ResolvedArticle } from '@/lib/storyblok/storyblok-article';

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

import HeroVideoBlock from '@/components/content-blocks/hero-video';
import TextBlock from '@/components/content-blocks/text';
import PageContentType from '@/components/content-types/page';
import { defaultLanguage } from '@/lib/i18n/utils';
import type { ISbStoriesParams } from '@storyblok/js';
import { apiPlugin, storyblokInit } from '@storyblok/react';
import { draftMode } from 'next/headers';
import { notFound } from 'next/navigation';

const storyblokComponents = {
	page: PageContentType,
	heroVideo: HeroVideoBlock,
	text: TextBlock,
};

export const getStoryblokApi = () => {
	return storyblokInit({
		accessToken: process.env.STORYBLOK_PREVIEW_TOKEN,
		use: [apiPlugin],
		components: storyblokComponents,
		enableFallbackComponent: true,
	})();
};

export async function getStoryParams(language: string): Promise<ISbStoriesParams> {
	return {
		language,
		version: (await draftMode()).isEnabled ? 'draft' : 'published',
	};
}

export async function withLanguageFallback<T>(
	loader: (lang: string, slug: string) => Promise<T>,
	lang: string,
	slug: string,
): Promise<T> {
	try {
		return await loader(lang, slug);
	} catch (error: any) {
		if (error?.status === 404) {
			if (lang === defaultLanguage) {
				return notFound();
			}
			return await withLanguageFallback(loader, defaultLanguage, slug);
		}
		throw error;
	}
}

export async function getStoryWithFallback<T>(slug: string, lang: string) {
	return withLanguageFallback(
		async (language: string) => {
			const response = await getStoryblokApi().get(`cdn/stories/${slug}`, await getStoryParams(language));
			return response.data.story as T;
		},
		lang,
		slug,
	);
}

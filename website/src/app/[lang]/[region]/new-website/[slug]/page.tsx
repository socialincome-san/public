import { DefaultLayoutPropsWithSlug } from '@/app/[lang]/[region]';
import PageContentType from '@/components/content-types/page';
import { Page } from '@/generated/storyblok/types/109655/storyblok-components';
import { Translator } from '@/lib/i18n/translator';
import { getStoryWithFallback } from '@/lib/storyblok';
import type { ISbStoryData } from '@storyblok/js';
import { notFound } from 'next/navigation';

export const revalidate = 900;

export default async function ContentPage({params}: DefaultLayoutPropsWithSlug) {
	const { slug, lang } = await params;

	const story = await getStoryWithFallback<ISbStoryData<Page>>(`new-website/${slug}`, lang);

	if (!story) {
		return notFound();
	}

	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-common', 'website-donate'] });

	return <PageContentType blok={story.content} translator={translator} />;
}

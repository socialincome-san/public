import type { StoryBlokArticle, StoryBlokAuthor } from '@socialincome/shared/src/storyblok/article';
import { Badge, Typography } from '@socialincome/ui';
import { getStoryblokApi } from '@storyblok/react';
import { draftMode } from 'next/headers';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ISbStoriesParams, ISbStoryData } from 'storyblok-js-client/src/interfaces';
import { render } from 'storyblok-rich-text-react-renderer';
import StoryBlokAuthorImage from '@/app/[lang]/[region]/(website)/journal/StoryBlokAuthorImage';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { LanguageCode } from '@socialincome/shared/src/types/language';

export const revalidate = 3600; // Update once an hour

const NOT_FOUND = 404;

const DEFAULT_LANGUAGE = 'en';

async function loadArticle(lang: string, slug: string[]): Promise<any> {
	const params: ISbStoriesParams = {
		...(draftMode().isEnabled ? { version: 'draft' } : {}),
		resolve_relations: ['article.author', 'article.topics'],
		language: lang
	};
	return await getStoryblokApi().get(`cdn/stories/journal/${slug?.join('/')}`, params);
}

async function loadArticleWithFallbackToDefaultLanguage(lang: string, slug: string[]): Promise<any> {
	try {
		return await loadArticle(lang, slug);
	} catch (error: any) {
		if (error.status === NOT_FOUND) {
			if (lang === DEFAULT_LANGUAGE) {
				throw notFound();
			}
			return await loadArticle(DEFAULT_LANGUAGE, slug);
		}
		throw error;
	}
}

function getPublishedDateFormatted(date: string, lang: string) {
	const dateObject = new Date(date);
	const month = dateObject.toLocaleString(lang, { month: 'long' });
	return `${month} ${dateObject.getDate()}, ${dateObject.getFullYear()}`;
}

export default async function Page(props: { params: { slug: string[]; lang: LanguageCode; region: string } }) {
	const lang = props.params.lang;

	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-journal']
	});

	const loadArticleResponse = await loadArticleWithFallbackToDefaultLanguage(props.params.lang, props.params.slug);
	const articleData: StoryBlokArticle = loadArticleResponse.data.story.content;
	const author: ISbStoryData<StoryBlokAuthor> = articleData.author;


	return (
		<div className="blog w-full justify-center">
			<div className="bg-primary flex flex-col md:min-h-screen md:flex-row">
				<div className="md:order-2 md:w-1/2">
					<Image
						src={articleData.image.filename}
						alt={articleData.image?.alt}
						className="w-full object-cover md:h-screen"
						width={900}
						height={700}
					/>
				</div>
				<div
					className="flex flex-col items-center justify-center p-8 text-center md:order-1 md:w-1/2 md:items-start md:text-left lg:p-16">
					<div className="flex flex-wrap justify-center gap-2 md:justify-start">
						{articleData.topics?.map((topic) => (
							<Badge key={topic.slug} variant="white" className="mb-2">
								{topic.content.value}
							</Badge>
						))}
					</div>
					<Typography className="mt-4" color="accent" size="5xl">
						{articleData.title}
					</Typography>
					<div className="mt-7 flex items-center space-x-4">
						<StoryBlokAuthorImage author={author} />
						<div className="text-left">
							<Typography color={'popover'} size="sm">
								{translator.t('published')} {getPublishedDateFormatted(loadArticleResponse.data.story.published_at, lang)}
							</Typography>
							<Typography color={'popover'} size="sm">
								{translator.t('written-by')}
								<Typography as="span" color={'accent'} className={'ml-1'}>
									{author.content.fullName}
								</Typography>
							</Typography>
						</div>
					</div>
				</div>
			</div>

			<div className="prose mx-auto max-w-2xl content-center p-4 my-10 sm:p-6">{render(articleData.content)}</div>
		</div>
	);
}

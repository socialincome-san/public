import type { StoryBlokArticle, StoryBlokAuthor } from '@socialincome/shared/src/storyblok/article';
import { Badge, Typography } from '@socialincome/ui';
import { getStoryblokApi } from '@storyblok/react';
import { draftMode } from 'next/headers';
import Image from 'next/image';
import type { ISbStoriesParams } from 'storyblok-js-client/src/interfaces';
import { render } from 'storyblok-rich-text-react-renderer';

export const revalidate = 3600; // Update once an hour

export default async function Page(props: { params: { slug: string; lang: string } }) {
	const lang = props.params.lang;

	async function loadArticle() {
		const params: ISbStoriesParams = {
			...(draftMode().isEnabled ? { version: 'draft' } : {}),
			resolve_relations: ['article.author', 'article.tags'],
			language: lang,
		};
		const { data } = await getStoryblokApi().get(`cdn/stories/journal/${props.params.slug}`, params);
		return data;
	}

	const data = await loadArticle();
	const articleData: StoryBlokArticle = data.story.content;
	const author: StoryBlokAuthor = articleData.author;

	function getPublishedDateFormatted(date: string, lang: string) {
		const dateObject = new Date(date);
		const month = dateObject.toLocaleString(lang, { month: 'long' });
		return `${month} ${dateObject.getDate()}, ${dateObject.getFullYear()}`;
	}

	return (
		<div className="blog w-full justify-center">
			<div className="bg-primary flex flex-col md:min-h-screen md:flex-row">
				<div className="md:order-2 md:w-1/2">
					<Image
						src={articleData.image?.filename ?? '/placeholder.svg'}
						alt={articleData.image?.alt ?? 'Article image'}
						className="w-full object-cover md:h-screen"
						width={900}
						height={700}
					/>
				</div>
				<div className="flex flex-col items-center justify-center p-8 text-center md:order-1 md:w-1/2 md:items-start md:text-left lg:p-16">
					<div className="flex flex-wrap justify-center gap-2 md:justify-start">
						{articleData.tags?.map((tag) => (
							<Badge key={tag.slug} variant="foreground" className="mb-2">
								{tag.content.value}
							</Badge>
						))}
					</div>
					<Typography className="mt-4" color="accent" size="5xl">
						{articleData.title}
					</Typography>
					<div className="mt-7 flex items-center space-x-4">
						<Image
							src={author.content.avatar.filename ?? '/placeholder.svg'}
							alt="author"
							className="size-12 flex-none rounded-full"
							width={100}
							height={100}
						/>
						<div>
							<Typography color={'popover'} size="sm">
								Published {getPublishedDateFormatted(data.story.published_at, lang)}
							</Typography>
							<Typography color={'popover'} size="sm">
								by{' '}
								<Typography as="span" color={'accent'}>
									{author.content.fullName}
								</Typography>
							</Typography>
						</div>
					</div>
				</div>
			</div>

			{/* Content Section */}
			<div className="prose mx-auto max-w-3xl content-center p-4 sm:p-6">{render(articleData.content)}</div>
		</div>
	);
}

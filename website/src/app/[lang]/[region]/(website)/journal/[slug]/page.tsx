import { StoryBlokArticle, StoryBlokAuthor } from '@socialincome/shared/src/storyblok/article';
import { Badge, Typography } from '@socialincome/ui';
import { getStoryblokApi } from '@storyblok/react';
import { draftMode } from 'next/headers';
import Image from 'next/image';
import type { ISbStoriesParams } from 'storyblok-js-client/src/interfaces';
import { render } from 'storyblok-rich-text-react-renderer';

export const revalidate = 3600; // Update once an hour

export default async function Page(props: { params: { slug: string; lang: string } }) {
	let lang = props.params.lang;
	async function loadArticle() {
		const params: ISbStoriesParams = {
			...(draftMode().isEnabled ? { version: 'draft' } : {}),
			resolve_relations: 'article.author',
			language: lang,
		};
		const { data } = await getStoryblokApi().get(`cdn/stories/journal/${props.params.slug}`, params);
		return data;
	}
	const data = await loadArticle();
	const articleData: StoryBlokArticle = data.story.content;
	const author: StoryBlokAuthor = articleData.author;

	function getPublishedDateFormatted(date: string, lang: string) {
		let dateObject = new Date(date);
		let month = dateObject.toLocaleString(lang, { month: 'long' });
		return `${month} ${dateObject.getDate()}, ${dateObject.getFullYear()}`;
	}

	return (
		<div className="blog w-full justify-center">
			<div className="bg-primary flex flex-col items-center md:flex-row">
				<div className="flex flex-col items-center justify-center p-8 text-center md:w-1/2 md:items-start md:text-left lg:p-16">
					<div className="mb-4 flex flex-wrap justify-center gap-2 md:justify-start">
						{articleData.tags?.map((tag) => (
							<Badge key={tag} variant="accent" className="mb-2">
								<Typography>{tag}</Typography>
							</Badge>
						))}
					</div>
					<Typography className="mt-2" color="accent" size="5xl">
						{articleData.title}
					</Typography>
					<div className="mt-4 flex items-center space-x-4">
						<Image
							src={author.content.avatar.filename ?? '/placeholder.svg'}
							alt="author"
							className="size-12 flex-none rounded-full"
							width={100}
							height={100}
						/>
						<div>
							<Typography size="sm">Published {getPublishedDateFormatted(data.story.published_at, lang)}</Typography>
							<Typography size="sm">by {author.content.fullName}</Typography>
						</div>
					</div>
				</div>

				<div className="">
					<Image
						src={articleData.image?.filename ?? '/placeholder.svg'}
						alt={articleData.image?.alt ?? 'Article image'}
						className="h-auto w-full object-cover"
						width={800}
						height={700}
					/>
				</div>
			</div>

			{/* Content Section */}
			<div className="prose mx-auto content-center p-4 sm:p-6">{render(articleData.content)}</div>
		</div>
	);
}

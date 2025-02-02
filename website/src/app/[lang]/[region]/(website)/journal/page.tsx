import { StoryBlokArticle } from '@socialincome/shared/src/storyblok/article';
import { Card, Typography } from '@socialincome/ui';
import { getStoryblokApi } from '@storyblok/react';
import Link from 'next/link';
import type { ISbStoriesParams } from 'storyblok-js-client/src/interfaces';

export const revalidate = 3600; // Update once an hour

export default async function Page(props: { params: { lang: string } }) {
	const lang = props.params.lang;
	const params: ISbStoriesParams = {
		resolve_relations: ['article.author', 'article.topics'],
		language: lang,
		with_tag: 'overview',
	};
	const { data } = await getStoryblokApi().get(`cdn/stories`, params);
	console.log(JSON.stringify(data, null, 2));
	const blogObject: { content: StoryBlokArticle; default_full_slug: string }[] = data.stories;

	function getPublishedDateFormatted(date: string, lang: string) {
		const dateObject = new Date(date);
		const month = dateObject.toLocaleString(lang, { month: 'long' });
		return `${month} ${dateObject.getDate()}, ${dateObject.getFullYear()}`;
	}

	return (
		<div className="container mx-auto p-6">
			<Typography size={'5xl'}>Blog Overview</Typography>
			<div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
				{blogObject.map((blog) => (
					<Card key={blog.content.title} className="overflow-hidden rounded-2xl bg-white shadow-lg">
						<img src={blog.content.image.filename} alt={blog.content.image.alt} className="h-40 w-full object-cover" />
						<div className="p-4">
							<Typography>
								<Link href={'/' + blog.default_full_slug}>{blog.content.title}</Link>
							</Typography>
						</div>
					</Card>
				))}
			</div>
		</div>
	);
}

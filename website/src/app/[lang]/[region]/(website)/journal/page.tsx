import { StoryBlokArticle } from '@socialincome/shared/src/storyblok/article';
import { BaseContainer, Card, CardContent, Typography } from '@socialincome/ui';
import { getStoryblokApi } from '@storyblok/react';
import Image from 'next/image';
import Link from 'next/link';
import type { ISbStoriesParams } from 'storyblok-js-client/src/interfaces';

export const revalidate = 3600; // Update once an hour

export default async function Page(props: { params: { lang: string; region: string } }) {
	const lang = props.params.lang;
	const region = props.params.region;
	const params: ISbStoriesParams = {
		resolve_relations: ['article.author', 'article.topics'],
		language: lang,
		with_tag: 'overview',
	};
	const { data } = await getStoryblokApi().get(`cdn/stories`, params);
	const blogObject: { content: StoryBlokArticle; default_full_slug: string; published_at: string }[] = data.stories;

	function getPublishedDateFormatted(date: string) {
		const dateObject = new Date(date);
		return dateObject.toLocaleDateString();
	}

	return (
		<BaseContainer>
			<Typography size={'xl'}>Journal Overview</Typography>
			<div className="mt-5 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
				{blogObject.map((blog) => (
					<Link href={'/' + lang + '/' + region + '/' + blog.default_full_slug} key={blog.content.title}>
						<Card className="overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
							<Image
								src={blog.content.image.filename}
								alt={blog.content.title}
								width={600}
								height={400}
								className="h-48 w-full object-cover"
							/>
							<CardContent className="flex flex-grow flex-col p-6">
								<Typography className="mb-2 line-clamp-2 h-14 flex-grow text-xl font-semibold">
									{blog.content.title}
								</Typography>
								<div className="mt-auto flex items-center justify-between">
									<div className="flex items-center space-x-2">
										<Image
											src={blog.content.author.content.avatar.filename}
											alt="author"
											className="size-12 flex-none rounded-full"
											width={100}
											height={100}
										/>
										<Typography>{blog.content.author.content.fullName}</Typography>
									</div>
									<Typography>{getPublishedDateFormatted(blog.published_at)}</Typography>
								</div>
							</CardContent>
						</Card>
					</Link>
				))}
			</div>
		</BaseContainer>
	);
}

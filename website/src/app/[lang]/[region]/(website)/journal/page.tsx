import { StoryBlokArticle } from '@socialincome/shared/src/storyblok/article';
import { BaseContainer, Card, CardContent, Typography } from '@socialincome/ui';
import { getStoryblokApi } from '@storyblok/react';
import Image from 'next/image';
import Link from 'next/link';
import { ISbStories, ISbStoriesParams } from 'storyblok-js-client/src/interfaces';
import StoryBlokAuthorImage from '@/app/[lang]/[region]/(website)/journal/StoryBlokAuthorImage';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { LanguageCode } from '@socialincome/shared/src/types/language';

export const revalidate = 3600; // Update once an hour

async function loadOverviewBlogs(lang: string): Promise<ISbStories<StoryBlokArticle>> {
	const params: ISbStoriesParams = {
		resolve_relations: ['article.author', 'article.topics'],
		language: lang,
		with_tag: 'overview',
		sort_by: 'created_at:desc'
	};
	return await getStoryblokApi().get(`cdn/stories`, params);
}

export default async function Page(props: { params: { lang: LanguageCode; region: string } }) {
	const region = props.params.region;
	const lang = props.params.lang;
	const overviewBlogsResponse = await loadOverviewBlogs(lang);
	const blogObjects = overviewBlogsResponse.data.stories;
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-journal']
	});

	function getPublishedDateFormatted(date: string) {
		const dateObject = new Date(date);
		return dateObject.toLocaleDateString();
	}

	function getHref(slug: string) {
		return `/${lang}/${region}/${slug}`;
	}

	return (
		<BaseContainer>
			<Typography weight={'bold'} className={'text-center'} size={'3xl'}>{translator.t('overview.title')}</Typography>
			<Typography className={'text-center mt-5'} size={'xl'}>{translator.t('overview.description')}</Typography>
			<div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
				{blogObjects.map((blog) => (
					<Link href={getHref(blog.default_full_slug!)} key={blog.content.title}>
						<Card className="overflow-hidden transition-transform duration-300 hover:scale-105">
							<Image
								src={blog.content.image.filename}
								alt={blog.content.title}
								width={600}
								height={400}
								className="h-48 w-full object-cover"
							/>
							<CardContent className="flex flex-grow flex-col p-6">
								<Typography size={'xl'} className="mb-4 line-clamp-2 h-14 flex-grow font-medium ">
									{blog.content.title}
								</Typography>
								<div className="mt-auto flex items-center justify-between">
									<div className="flex items-center space-x-2">
										<StoryBlokAuthorImage author={blog.content.author} />
										<Typography>{blog.content.author.content.fullName}</Typography>
									</div>
									<Typography>{getPublishedDateFormatted(blog.published_at!)}</Typography>
								</div>
							</CardContent>
						</Card>
					</Link>
				))}
			</div>
		</BaseContainer>
	);
}

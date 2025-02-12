import { DefaultPageProps } from '@/app/[lang]/[region]';
import StoryblokAuthorImage from '@/app/[lang]/[region]/(website)/journal/StoryblokAuthorImage';
import { StoryblokArticle } from '@socialincome/shared/src/storyblok/journal';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Card, CardContent, Typography } from '@socialincome/ui';
import { getStoryblokApi } from '@storyblok/react';
import { DateTime } from 'luxon';
import Image from 'next/image';
import Link from 'next/link';
import { ISbStories, ISbStoriesParams } from 'storyblok-js-client/src/interfaces';

export const revalidate = 900;

function getPublishedDateFormatted(date: string) {
	const dateObject = DateTime.fromISO(date);
	return dateObject.isValid ? dateObject.toFormat('dd/MM/yyyy') : '';
}

async function loadOverviewBlogs(lang: string): Promise<ISbStories<StoryblokArticle>> {
	const params: ISbStoriesParams = {
		resolve_relations: ['article.author', 'article.topics'],
		language: lang,
		with_tag: 'overview',
		sort_by: 'created_at:desc',
	};
	return await getStoryblokApi().get(`cdn/stories`, params);
}

export default async function Page({ params: { lang, region } }: DefaultPageProps) {
	const overviewBlogsResponse = await loadOverviewBlogs(lang);
	const blogObjects = overviewBlogsResponse.data.stories;
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-journal'],
	});

	return (
		<BaseContainer>
			<Typography weight="bold" className="text-center" size="3xl">
				{translator.t('overview.title')}
			</Typography>
			<Typography className="mt-5 text-center" size="xl">
				{translator.t('overview.description')}
			</Typography>
			<div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
				{blogObjects.map((blog) => (
					<Link href={`/${lang}/${region}/${blog.default_full_slug!}`} key={blog.content.title}>
						<Card className="overflow-hidden transition-transform duration-300 hover:scale-[102%]">
							<Image
								src={blog.content.image.filename}
								alt={blog.content.title}
								width={600}
								height={400}
								className="h-48 w-full object-cover"
							/>
							<CardContent className="flex flex-grow flex-col p-6">
								<Typography size="xl" className="mb-4 line-clamp-2 h-14 flex-grow font-medium">
									{blog.content.title}
								</Typography>
								<div className="mt-auto flex items-center justify-between">
									<div className="flex items-center space-x-2">
										<StoryblokAuthorImage author={blog.content.author} />
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

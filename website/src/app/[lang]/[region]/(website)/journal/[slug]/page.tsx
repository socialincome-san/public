import { getArticle, getPublishedDateFormatted } from '@/app/[lang]/[region]/(website)/journal/StoryblokApi';
import StoryblokAuthorImage from '@/app/[lang]/[region]/(website)/journal/StoryblokAuthorImage';
import { StoryblokAuthor, StoryblokTag } from '@socialincome/shared/src/storyblok/journal';
import { LanguageCode } from '@socialincome/shared/src/types/language';
import { Badge, Separator, Typography } from '@socialincome/ui';
import { ISbStoryData } from '@storyblok/react';
import Image from 'next/image';
import Link from 'next/link';
import { render } from 'storyblok-rich-text-react-renderer';

export const revalidate = 900;

function badgeWithLink(lang: string, region: string, tag: ISbStoryData<StoryblokTag>, variant: 'outline' | 'default') {
	return (
		<Link href={`/${lang}/${region}/journal/tag/${tag.slug}`}>
			<Badge key={tag.slug} variant={variant} className="mt-6">
				{tag.content.value}
			</Badge>
		</Link>
	);
}

export default async function Page(props: { params: { slug: string; lang: LanguageCode; region: string } }) {
	const { slug, lang, region } = props.params;

	const articleResponse = await getArticle(lang, slug);
	const articleData = articleResponse.data.story.content;
	const author: ISbStoryData<StoryblokAuthor> = articleData.author;

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
				<div className="flex flex-col items-center justify-center p-8 text-center md:order-1 md:w-1/2 md:items-start md:text-left lg:p-16">
					<div className="flex flex-wrap justify-center gap-2 md:justify-start">
						<Typography
							weight="medium"
							color="popover"
							size="lg"
							key={articleData.type?.content.id}
							className="uppercase"
						>
							{articleData.type?.content.value}
						</Typography>
						<Typography size="lg" weight="normal" color="popover" className="ml-4">
							{getPublishedDateFormatted(articleResponse.data.story.published_at!, lang)}
						</Typography>
					</div>
					<Typography weight="medium" className="mt-8" color="accent" size="5xl">
						{articleData.title}
					</Typography>

					<Link href={`/${lang}/${region}/journal/author/${author.slug}`}>
						<div className="mt-8 flex items-center space-x-4">
							<StoryblokAuthorImage size="large" author={author} lang={lang} region={region} />
							<Typography size="lg" as="span" color={'popover'} className="ml-1">
								{author.content.fullName}
							</Typography>
						</div>
					</Link>

					<div className="mt-4 flex flex-wrap justify-center gap-2 md:justify-start">
						{articleData.tags?.map((tag) => badgeWithLink(lang, region, tag, 'outline'))}
					</div>
				</div>
			</div>

			<div className="prose mx-auto my-4 max-w-2xl content-center p-4 sm:p-6">
				<Typography weight="bold" size="2xl">
					{articleData.leadText}
				</Typography>
				<Typography as="div" className="text-black">
					{render(articleData.content)}
				</Typography>
				<Separator />

				<div className="mt-4 flex flex-wrap justify-center gap-2 md:justify-start">
					{articleData.tags?.map((tag) => badgeWithLink(lang, region, tag, 'default'))}
				</div>

				<Link href={`/${lang}/${region}/journal/author/${author.slug}`}>
					<div className="mt-6 flex items-center space-x-4">
						<StoryblokAuthorImage size="large" author={author} lang={lang} region={region} />
						<Typography size="lg" as="span" className="ml-1" color="primary">
							{author.content.fullName}
						</Typography>
					</div>
				</Link>
			</div>
		</div>
	);
}

import {
	getDimensionsFromStoryblokImageUrl,
	getPublishedDateFormatted,
} from '@/app/[lang]/[region]/(website)/journal/StoryblokApi';
import StoryblokAuthorImage from '@/app/[lang]/[region]/(website)/journal/StoryblokAuthorImage';
import { StoryblokArticle, StoryblokAuthor } from '@socialincome/shared/src/storyblok/journal';
import { Typography } from '@socialincome/ui';
import { ISbStoryData } from '@storyblok/react';
import Image from 'next/image';
import Link from 'next/link';

export function StoryblokArticleCard(props: {
	lang: string;
	region: string;
	blog: ISbStoryData<StoryblokArticle>;
	author: ISbStoryData<StoryblokAuthor>;
}) {
	const { region, lang, blog, author } = props;
	const dimensionsFromStoryblokImage = getDimensionsFromStoryblokImageUrl(blog.content.image.filename);
	return (
		<Link href={`/${props.lang}/${props.region}/journal/${blog.slug!}`}>
			<div className="mb-4 overflow-hidden transition-transform duration-200 hover:scale-[101%]">
				<Image
					src={blog.content.image.filename}
					alt={blog.content.title}
					width={dimensionsFromStoryblokImage.width}
					height={dimensionsFromStoryblokImage.height}
					className="h-60 w-full object-cover"
				/>
				<div className="mt-2 flex items-center justify-between">
					<div className="flex items-center space-x-2">
						<Typography weight="bold" size="sm" className="uppercase">
							{blog.content.type?.content.value}
						</Typography>
					</div>
					<Typography weight="normal" className="text-black">
						{getPublishedDateFormatted(blog.first_published_at!, props.lang)}
					</Typography>
				</div>

				<div className="mt-2 flex flex-grow flex-col">
					<Typography size="2xl" className="mb-4 line-clamp-3 h-16 flex-grow" weight="medium">
						{blog.content.title}
					</Typography>
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-2">
							<StoryblokAuthorImage size="large" author={author} region={region} lang={lang} />
							<Typography className="ml-1" size="lg">
								{blog.content.author.content.fullName}
							</Typography>
						</div>
					</div>
					<Typography size="md" weight="normal" className="mt-4 line-clamp-4 text-black">
						{blog.content.leadText}
					</Typography>
				</div>
			</div>
		</Link>
	);
}

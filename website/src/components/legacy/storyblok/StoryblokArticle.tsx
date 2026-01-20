import { ResolvedArticle } from '@/components/legacy/storyblok/StoryblokApi';
import StoryblokAuthorImage from '@/components/legacy/storyblok/StoryblokAuthorImage';
import { formatStoryblokDate, formatStoryblokUrl } from '@/components/legacy/storyblok/StoryblokUtils';
import { Typography } from '@socialincome/ui';
import type { ISbStoryData } from '@storyblok/js';
import Image from 'next/image';
import Link from 'next/link';

const ARTICLE_IMAGE_TARGET_WIDTH = 1920;
const ARTICLE_IMAGE_TARGET_HEIGHT = 1080;

export function StoryblokArticleCard(props: { lang: string; region: string; article: ISbStoryData<ResolvedArticle> }) {
	const { region, lang, article } = props;
	const author = article.content.author;
	return (
		<Link href={`/${props.lang}/${props.region}/journal/${article.slug!}`}>
			<div className="mb-4 overflow-hidden transition-transform duration-200 hover:scale-[101%]">
				{article.content.image.filename && (
					<Image
						src={formatStoryblokUrl(
							article.content.image.filename,
							ARTICLE_IMAGE_TARGET_WIDTH,
							ARTICLE_IMAGE_TARGET_HEIGHT,
							article.content.image.focus,
						)}
						alt={article.content.title}
						width={ARTICLE_IMAGE_TARGET_WIDTH}
						height={ARTICLE_IMAGE_TARGET_HEIGHT}
						className="h-60 w-full object-cover"
					/>
				)}
				<div className="mt-2 flex items-center justify-between">
					<div className="flex items-center space-x-2">
						<Typography weight="bold" size="sm" className="uppercase">
							{article.content.type?.content?.value}
						</Typography>
					</div>
					<Typography weight="normal" className="text-black">
						{formatStoryblokDate(article.first_published_at, props.lang)}
					</Typography>
				</div>

				<div className="mt-2 flex flex-grow flex-col">
					<Typography
						aria-label={article.content.title}
						size="xl"
						className="md:h-18 my-4 line-clamp-2 h-14 w-auto overflow-hidden break-words md:line-clamp-3"
						weight="medium"
					>
						{`${article.content.title}${article.content.subtitle ? ' ' + article.content.subtitle : ''}`}
					</Typography>
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-2">
							<StoryblokAuthorImage size="large" author={author} region={region} lang={lang} />
							<Typography className="ml-1" size="lg">
								{`${author.content.firstName} ${author.content.lastName}`}
							</Typography>
						</div>
					</div>
					<Typography size="md" weight="normal" className="mt-4 line-clamp-4 text-black">
						{article.content.leadText}
					</Typography>
				</div>
			</div>
		</Link>
	);
}

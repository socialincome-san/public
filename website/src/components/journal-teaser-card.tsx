import StoryblokAuthorImage from '@/components/legacy/storyblok/StoryblokAuthorImage';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import {
	createLinkForArticle,
	formatStoryblokUrl,
	getArticleTitle,
	ResolvedArticle,
} from '@/lib/services/storyblok/storyblok.utils';
import { Typography } from '@socialincome/ui';
import type { ISbStoryData } from '@storyblok/js';
import Image from 'next/image';
import Link from 'next/link';

const FEATURED_IMAGE_WIDTH = 658;
const FEATURED_IMAGE_HEIGHT = 380;
const SECONDARY_IMAGE_WIDTH = 281;
const SECONDARY_IMAGE_HEIGHT = 230;

type Props = {
	article: ISbStoryData<ResolvedArticle>;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
	isFeatured: boolean;
};

type CardContentProps = {
	title: string;
	content: ResolvedArticle;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
	className: string;
};

export const JournalTeaserCard = ({ article, lang, region, isFeatured }: Props) => {
	const { content } = article;
	const articleLink = article.slug ? createLinkForArticle(article.slug, lang, region) : `/${lang}/${region}/journal`;
	const imageWidth = isFeatured ? FEATURED_IMAGE_WIDTH : SECONDARY_IMAGE_WIDTH;
	const imageHeight = isFeatured ? FEATURED_IMAGE_HEIGHT : SECONDARY_IMAGE_HEIGHT;
	const imageSource = content.image.filename
		? formatStoryblokUrl(content.image.filename, imageWidth, imageHeight, content.image.focus)
		: null;
	const title = getArticleTitle(article);

	if (isFeatured) {
		return (
			<Link
				href={articleLink}
				className="bg-card flex flex-col rounded-xl border border-black/5 p-3 shadow-sm transition-transform hover:scale-101"
			>
				{imageSource && (
					<Image
						src={imageSource}
						alt={content.image.alt || content.title}
						width={FEATURED_IMAGE_WIDTH}
						height={FEATURED_IMAGE_HEIGHT}
						sizes="(min-width: 1280px) 596px, 100vw"
						className="h-auto w-full rounded-xl object-cover"
					/>
				)}
				<div className="flex grow flex-col justify-between gap-3 pt-4 lg:p-6">
					<h3 className="text-2xl md:text-3xl">{title}</h3>
					<div className="flex items-center gap-2">
						<StoryblokAuthorImage author={content.author} size="small" lang={lang} region={region} />
						<Typography size="xs" weight="bold">
							{`${content.author.content.firstName} ${content.author.content.lastName}`}
						</Typography>
					</div>
				</div>
			</Link>
		);
	}

	return (
		<Link
			href={articleLink}
			className="bg-card grid grid-cols-[50%_50%] overflow-hidden rounded-xl border border-black/5 p-3 shadow-sm transition-transform hover:scale-101"
		>
			<div className="flex flex-col justify-between gap-3 py-3 lg:px-4 lg:py-6">
				<h3 className="text-xl md:text-2xl lg:text-3xl">{title}</h3>
				<div className="flex items-center gap-2">
					<StoryblokAuthorImage author={content.author} size="small" lang={lang} region={region} />
					<Typography size="xs" weight="bold">
						{`${content.author.content.firstName} ${content.author.content.lastName}`}
					</Typography>
				</div>
			</div>
			{imageSource && (
				<Image
					src={imageSource}
					alt={content.image.alt || content.title}
					width={SECONDARY_IMAGE_WIDTH}
					height={SECONDARY_IMAGE_HEIGHT}
					sizes="281px"
					className="h-auto w-full rounded-xl"
				/>
			)}
		</Link>
	);
};

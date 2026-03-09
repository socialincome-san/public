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

const TeaserCardContent = ({ title, content, lang, region, className }: CardContentProps) => (
	<div className={className}>
		<Typography size="3xl" lineHeight="normal" className="line-clamp-3">
			{title}
		</Typography>
		<div className="mt-auto flex items-center gap-2">
			<StoryblokAuthorImage author={content.author} size="small" lang={lang} region={region} />
			<Typography size="xs" weight="bold">
				{`${content.author.content.firstName} ${content.author.content.lastName}`}
			</Typography>
		</div>
	</div>
);

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
			<Link href={articleLink} className="bg-card flex h-full flex-col rounded-xl border border-black/5 p-3 shadow-sm">
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
				<TeaserCardContent
					title={title}
					content={content}
					lang={lang}
					region={region}
					className="flex h-full flex-col gap-5 pt-4 lg:p-6"
				/>
			</Link>
		);
	}

	return (
		<Link
			href={articleLink}
			className="bg-card flex h-full flex-col overflow-hidden rounded-xl border border-black/5 py-3 pr-3 shadow-sm md:flex-row lg:pl-0"
		>
			<TeaserCardContent
				title={title}
				content={content}
				lang={lang}
				region={region}
				className="order-2 flex h-full flex-1 grow-0 basis-1/2 flex-col justify-between px-6 py-6 md:order-1 xl:px-8"
			/>
			{imageSource && (
				<Image
					src={imageSource}
					alt={content.image.alt || content.title}
					width={SECONDARY_IMAGE_WIDTH}
					height={SECONDARY_IMAGE_HEIGHT}
					sizes="281px"
					className="order-1 h-auto w-full grow-0 basis-1/2 rounded-xl md:order-2"
				/>
			)}
		</Link>
	);
};

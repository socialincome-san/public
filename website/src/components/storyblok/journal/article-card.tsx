'use client';

import { AuthorAvatar } from '@/components/storyblok/journal/author-avatar';
import { VideoBadge } from '@/components/storyblok/journal/video-badge';
import { useIsMobile } from '@/lib/hooks/use-is-mobile';
import {
	createWebsiteJournalArticleLink,
	createWebsiteJournalPath,
	formatStoryblokDate,
	formatStoryblokUrl,
	getArticleTitle,
	getPersonDisplayName,
	ResolvedArticle,
} from '@/lib/services/storyblok/storyblok.utils';
import { cn } from '@/lib/utils/cn';
import type { ISbStoryData } from '@storyblok/js';
import Image from 'next/image';
import Link from 'next/link';

const GRID_IMAGE_WIDTH = 658;
const GRID_IMAGE_HEIGHT = 380;
const FEATURED_IMAGE_WIDTH = 658;
const FEATURED_IMAGE_HEIGHT = 380;
const SECONDARY_IMAGE_WIDTH = 281;
const SECONDARY_IMAGE_HEIGHT = 230;

type Variant = 'grid' | 'featured' | 'secondary';

type Props = {
	article: ISbStoryData<ResolvedArticle>;
	lang: string;
	region: string;
	variant?: Variant;
	videoLabel: string;
};

export const JournalArticleCard = ({ article, lang, region, variant = 'grid', videoLabel }: Props) => {
	const isMobile = useIsMobile();
	const effectiveVariant = isMobile ? 'featured' : variant;
	const { content } = article;
	const author = content.author;
	const href = article.slug
		? createWebsiteJournalArticleLink(article.slug, lang, region)
		: createWebsiteJournalPath(lang, region);

	const imageWidth = effectiveVariant === 'secondary' ? SECONDARY_IMAGE_WIDTH : GRID_IMAGE_WIDTH;
	const imageHeight = effectiveVariant === 'secondary' ? SECONDARY_IMAGE_HEIGHT : GRID_IMAGE_HEIGHT;
	const image = content.image;
	const imageSrc = image?.filename ? formatStoryblokUrl(image.filename, imageWidth, imageHeight, image.focus) : null;
	const title = getArticleTitle(article);

	if (effectiveVariant === 'featured') {
		return (
			<Link
				href={href}
				className="bg-card border-border flex flex-col overflow-hidden rounded-xl border p-3 shadow-sm transition-transform hover:scale-[1.01]"
			>
				{imageSrc && (
					<div className="relative">
						<Image
							src={imageSrc}
							alt={image?.alt ?? content.title}
							width={FEATURED_IMAGE_WIDTH}
							height={FEATURED_IMAGE_HEIGHT}
							sizes="(min-width: 1280px) 596px, 100vw"
							className="aspect-[658/380] w-full rounded-xl object-cover"
						/>
						{content.videoLabel && <VideoBadge label={videoLabel} className="absolute top-3 left-3" />}
					</div>
				)}
				<div className="flex flex-1 flex-col justify-between gap-3 p-4 lg:p-6">
					<h3 className="text-foreground text-2xl md:text-3xl">{title}</h3>
					<div className="flex items-center gap-2">
						<AuthorAvatar author={author} size="sm" />
						<span className="text-sm font-bold">{getPersonDisplayName(author)}</span>
					</div>
				</div>
			</Link>
		);
	}

	if (effectiveVariant === 'secondary') {
		return (
			<Link
				href={href}
				className={cn(
					'bg-card border-border grid overflow-hidden rounded-xl border p-3 shadow-sm transition-transform hover:scale-[1.01]',
					imageSrc ? 'grid-cols-2' : 'grid-cols-1',
				)}
			>
				<div className="flex flex-col justify-between gap-3 py-3 lg:px-4 lg:py-6">
					<h3 className="text-foreground text-xl md:text-2xl lg:text-3xl">{title}</h3>
					<div className="flex items-center gap-2">
						<AuthorAvatar author={author} size="sm" />
						<span className="text-sm font-bold">{getPersonDisplayName(author)}</span>
					</div>
				</div>
				{imageSrc && (
					<div className="relative">
						<Image
							src={imageSrc}
							alt={image?.alt ?? content.title}
							width={SECONDARY_IMAGE_WIDTH}
							height={SECONDARY_IMAGE_HEIGHT}
							sizes="281px"
							className="h-auto w-full rounded-xl object-cover"
						/>
						{content.videoLabel && <VideoBadge label={videoLabel} className="absolute top-2 left-2" />}
					</div>
				)}
			</Link>
		);
	}

	return (
		<Link
			href={href}
			className="bg-card border-border group flex flex-col overflow-hidden rounded-xl border shadow-sm transition-transform hover:scale-[1.01]"
		>
			{imageSrc && (
				<div className="relative">
					<Image
						src={imageSrc}
						alt={image?.alt ?? content.title}
						width={GRID_IMAGE_WIDTH}
						height={GRID_IMAGE_HEIGHT}
						sizes="(min-width: 1024px) 33vw, 100vw"
						className="aspect-[658/380] w-full object-cover"
					/>
					{content.videoLabel && <VideoBadge label={videoLabel} className="absolute top-3 left-3" />}
				</div>
			)}
			<div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
				<div className="text-muted-foreground flex items-center justify-between gap-2 text-xs font-medium">
					{content.type?.content?.value && <span className="capitalize">{content.type.content.value}</span>}
					<time dateTime={article.first_published_at ?? undefined}>
						{formatStoryblokDate(article.first_published_at, lang)}
					</time>
				</div>
				<h3 className="text-foreground line-clamp-3 text-xl font-bold md:text-2xl">{title}</h3>
				<div className="mt-auto flex items-center gap-2">
					<AuthorAvatar author={author} size="sm" />
					<span className="text-sm font-bold">{getPersonDisplayName(author)}</span>
				</div>
				{content.leadText && (
					<p className="text-muted-foreground line-clamp-4 text-sm leading-relaxed">{content.leadText}</p>
				)}
			</div>
		</Link>
	);
};

import { AuthorAvatar } from '@/components/storyblok/journal/author-avatar';
import { TagBadge } from '@/components/storyblok/journal/tag-badge';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { ARTICLE_HERO_IMAGE_HEIGHT, ARTICLE_HERO_IMAGE_WIDTH } from '@/lib/services/journal/journal.utils';
import {
	createNewWebsitePersonLink,
	formatStoryblokDate,
	getPersonDisplayName,
	ResolvedArticle,
} from '@/lib/services/storyblok/storyblok.utils';
import { cn } from '@/lib/utils/cn';
import type { ISbStoryData } from '@storyblok/js';
import Image from 'next/image';
import Link from 'next/link';

type Props = {
	story: ISbStoryData<ResolvedArticle>;
	hasHero: boolean;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
};

export const ArticleDetailHeader = ({ story, hasHero, lang, region }: Props) => {
	const article = story.content;
	const author = article.author;

	return (
		<header
			className={cn(
				'flex flex-col justify-center gap-6 p-6 md:p-10 lg:p-16',
				hasHero ? 'bg-primary text-primary-foreground lg:w-1/2' : 'w-site-width max-w-content mx-auto',
			)}
		>
			<div className="flex flex-wrap items-center gap-3 text-sm">
				{article.type?.content?.value && <span className="capitalize opacity-90">{article.type.content.value}</span>}
				<time dateTime={story.first_published_at ?? undefined} className="opacity-80">
					{formatStoryblokDate(story.first_published_at, lang)}
				</time>
			</div>

			<div className="space-y-3">
				<h1
					className={cn(
						'text-4xl font-semibold tracking-tight wrap-break-word hyphens-auto md:text-5xl',
						hasHero ? 'text-accent' : 'text-foreground',
					)}
				>
					{article.title}
				</h1>
				{article.subtitle ? (
					<p className={cn('text-2xl font-normal md:text-3xl', hasHero ? 'text-accent/90' : 'text-foreground')}>
						{article.subtitle}
					</p>
				) : null}
			</div>

			<Link
				href={createNewWebsitePersonLink(author.slug, lang, region)}
				className="flex w-fit items-center gap-3 transition-opacity hover:opacity-80"
			>
				<AuthorAvatar author={author} size="lg" />
				<span className="text-lg font-medium">{getPersonDisplayName(author)}</span>
			</Link>

			{article.tags && article.tags.length > 0 ? (
				<div className="flex flex-wrap gap-2">
					{article.tags.map((tag) => (
						<TagBadge key={tag.slug} tag={tag} lang={lang} region={region} variant={hasHero ? 'hero' : 'default'} />
					))}
				</div>
			) : null}
		</header>
	);
};

export const ArticleDetailHeroImage = ({ heroImageSrc, alt }: { heroImageSrc: string; alt: string }) => (
	<div className="lg:w-1/2">
		<Image
			src={heroImageSrc}
			alt={alt}
			width={ARTICLE_HERO_IMAGE_WIDTH}
			height={ARTICLE_HERO_IMAGE_HEIGHT}
			priority
			className="h-72 w-full object-cover lg:h-full lg:min-h-[70vh]"
		/>
	</div>
);

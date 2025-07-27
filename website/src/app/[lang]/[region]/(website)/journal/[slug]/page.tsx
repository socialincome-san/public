import { OriginalLanguageLink } from '@/components/storyblok/OriginalLanguage';
import { RichTextRenderer } from '@/components/storyblok/RichTextRenderer';
import { generateMetaDataForBlog, getArticle, getRelativeArticles } from '@/components/storyblok/StoryblokApi';
import { StoryblokArticleCard } from '@/components/storyblok/StoryblokArticle';
import StoryblokAuthorImage from '@/components/storyblok/StoryblokAuthorImage';
import { formatStoryblokDate, formatStoryblokUrl } from '@/components/storyblok/StoryblokUtils';
import { WebsiteRegion } from '@/lib/i18n/utils';
import { storyblokInitializationWorkaround } from '@/storyblok-init';
import { StoryblokAuthor, StoryblokTag } from '@/types/journal';
import { LanguageCode } from '@socialincome/shared/src/types/language';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { Badge, Separator, Typography } from '@socialincome/ui';
import { ISbStoryData } from '@storyblok/react';
import Image from 'next/image';
import Link from 'next/link';
import { cache } from 'react';

export const revalidate = 900;
storyblokInitializationWorkaround();

//Currently NextJS Doesn't provide a way to not repeat API calls for generating metadata.
//Therefore, I used the cache of react to memoize the response
//https://github.com/vercel/next.js/discussions/67133
export async function generateMetadata(props: {
	params: Promise<{ slug: string; lang: LanguageCode; region: WebsiteRegion }>;
}) {
	const { slug, lang } = await props.params;
	const articleResponse = await getArticleMemoized(lang, slug);
	const url = `https://socialincome.org/${lang}/journal/${articleResponse.data.story.slug}`;
	return generateMetaDataForBlog(articleResponse.data.story, url);
}

const getArticleMemoized = cache(async (lang: string, slug: string) => {
	return await getArticle(lang, slug);
});

function badgeWithLink(
	lang: string,
	region: string,
	tag: ISbStoryData<StoryblokTag>,
	variant: 'outline' | 'foreground',
) {
	return (
		<Link key={tag.slug} href={`/${lang}/${region}/journal/tag/${tag.slug}`}>
			<Badge variant={variant} className="mt-6">
				{tag.content?.value}
			</Badge>
		</Link>
	);
}

const NUMBER_OF_RELATIVE_ARTICLES = 3;
const ARTICLE_IMAGE_WIDTH = 960;
const ARTICLE_IMAGE_HEIGHT = 960;
export default async function Page(props: {
	params: Promise<{ slug: string; lang: LanguageCode; region: WebsiteRegion }>;
}) {
	const { slug, lang, region } = await props.params;

	const articleResponse = await getArticleMemoized(lang, slug);
	const articleData = articleResponse.data.story.content;
	const author: ISbStoryData<StoryblokAuthor> = articleData.author;

	const blogs = await getRelativeArticles(
		author.uuid,
		articleResponse.data.story.id,
		articleData.tags?.map((it) => it.uuid),
		lang,
		NUMBER_OF_RELATIVE_ARTICLES,
	);
	const articleWithImageStyling = !articleData.useImageOnlyForPreview;
	let translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-journal', 'common', 'website-newsletter', 'website-donate'],
	});

	return (
		<div>
			<div className="blog w-full justify-center">
				<div className={articleWithImageStyling ? 'bg-primary flex flex-col lg:min-h-screen lg:flex-row' : ''}>
					{articleWithImageStyling && (
						<div className="lg:order-2 lg:w-1/2">
							<Image
								src={formatStoryblokUrl(
									articleData.image.filename,
									ARTICLE_IMAGE_WIDTH,
									ARTICLE_IMAGE_HEIGHT,
									articleData.image.focus,
								)}
								alt={articleData.image?.alt}
								className="w-full object-cover lg:h-screen"
								width={ARTICLE_IMAGE_WIDTH}
								height={ARTICLE_IMAGE_HEIGHT}
							/>
						</div>
					)}
					<div
						className={
							articleWithImageStyling
								? 'flex flex-col justify-center p-8 text-left lg:order-1 lg:w-1/2 lg:items-start lg:p-16'
								: 'mx-auto mt-16 max-w-2xl content-center p-4 sm:p-6'
						}
					>
						<div className="flex flex-wrap justify-start gap-2">
							<Typography
								weight="medium"
								color={articleWithImageStyling ? 'popover' : 'foreground'}
								size="lg"
								key={articleData.type?.content.id}
								className="uppercase"
							>
								{articleData.type?.content.value}
							</Typography>
							<Typography
								size="lg"
								weight="normal"
								color={articleWithImageStyling ? 'popover' : 'foreground'}
								className="ml-5"
							>
								{formatStoryblokDate(articleResponse.data.story.first_published_at, lang)}
							</Typography>
						</div>
						<Typography
							weight="medium"
							className="mb-3 mt-8 hyphens-auto break-words"
							color={articleWithImageStyling ? 'accent' : 'foreground'}
							size="5xl"
						>
							{articleData.title}
						</Typography>
						<Typography
							weight="normal"
							className="hyphens-auto break-words"
							color={articleWithImageStyling ? 'accent' : 'foreground'}
							size="3xl"
						>
							{articleData.subtitle}
						</Typography>

						<Link href={`/${lang}/${region}/journal/author/${author.slug}`}>
							<div className="mt-8 flex items-center space-x-4">
								<StoryblokAuthorImage size="large" author={author} lang={lang} region={region} />
								<Typography
									weight="normal"
									size="lg"
									as="span"
									color={articleWithImageStyling ? 'popover' : 'foreground'}
									className="ml-1"
								>
									{author.content.fullName}
								</Typography>
							</div>
						</Link>

						<div className="mt-4 flex flex-wrap justify-start gap-2">
							{articleData.tags?.map((tag) =>
								badgeWithLink(lang, region, tag, articleWithImageStyling ? 'outline' : 'foreground'),
							)}
						</div>
					</div>
				</div>

				<div className="prose mx-auto my-2 max-w-2xl content-center p-4 sm:p-6">
					<OriginalLanguageLink
						originalLanguage={articleData.originalLanguage}
						slug={slug}
						lang={lang}
						region={region}
						text={translator.t('article.from-original-language')}
						languageName={translator.t('language-name.' + articleData.originalLanguage)}
					/>
					<Typography weight="bold" size="2xl">
						{articleData.leadText}
					</Typography>
					<Typography as="div" size="lg" className="text-black">
						<RichTextRenderer
							richTextDocument={articleData.content}
							translator={translator}
							lang={lang}
							region={region}
						/>
					</Typography>
					<Separator className="my-2" />
					{articleData.footnotes && (
						<Typography as="div" className="mt-5 text-black" size="md">
							<RichTextRenderer
								richTextDocument={articleData.footnotes}
								translator={translator}
								lang={lang}
								region={region}
							/>
						</Typography>
					)}
					<div className="mt-4 flex flex-wrap justify-start gap-2">
						{articleData.tags?.map((tag) => badgeWithLink(lang, region, tag, 'foreground'))}
					</div>
					<Link href={`/${lang}/${region}/journal/author/${author.slug}`} className="no-underline">
						<div className="mt-5 flex items-center space-x-4">
							<StoryblokAuthorImage size="large" author={author} lang={lang} region={region} />
							<Typography size="lg" as="span" className="ml-1" color="foreground">
								{author.content.fullName}
							</Typography>
						</div>
					</Link>
				</div>

				{articleData.showRelativeArticles && (
					<div>
						<Typography size="4xl" className="text-center" weight="semibold">
							{translator.t('article.keep-reading')}
						</Typography>
						<div className="mb-10 mt-3 grid grid-cols-1 content-center justify-center gap-4 p-10 md:pl-20 md:pr-20 lg:grid-cols-3">
							{blogs.map((blog) => (
								<StoryblokArticleCard
									key={blog.uuid}
									lang={lang}
									region={region}
									blog={blog}
									author={blog.content.author}
								/>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

import {
	getArticle,
	getPublishedDateFormatted,
	getRelativeArticles,
} from '@/app/[lang]/[region]/(website)/journal/StoryblokApi';
import { StoryblokArticleCard } from '@/app/[lang]/[region]/(website)/journal/StoryblokArticle';
import StoryblokAuthorImage from '@/app/[lang]/[region]/(website)/journal/StoryblokAuthorImage';
import {
	StoryblokArticle,
	StoryblokAuthor,
	StoryblokQuotedText,
	StoryblokTag,
} from '@socialincome/shared/src/storyblok/journal';
import { LanguageCode } from '@socialincome/shared/src/types/language';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { Badge, QuotedText, Separator, Typography, ImageWithCaption } from '@socialincome/ui';
import { ISbStoryData } from '@storyblok/react';
import Image from 'next/image';
import Link from 'next/link';
import { render } from 'storyblok-rich-text-react-renderer';
import { StoryblokImageWithCaption } from '@socialincome/shared/src/storyblok/journal';


export const revalidate = 900;

function renderWrapper(articleData: StoryblokArticle) {
	return render(articleData.content, {
		blokResolvers: {
			// @ts-ignore
			['quotedText']: (props: StoryblokQuotedText) => <QuotedText {...props} />,
			// @ts-ignore
			['Add image']: (props: StoryblokImageWithCaption) => <ImageWithCaption {...props} />,
		},
	});
}

function badgeWithLink(lang: string, region: string, tag: ISbStoryData<StoryblokTag>, variant: 'outline' | 'default') {
	return (
		<Link href={`/${lang}/${region}/journal/tag/${tag.slug}`}>
			<Badge key={tag.slug} variant={variant} className="mt-6">
				{tag.content.value}
			</Badge>
		</Link>
	);
}

const NUMBER_OF_RELATIVE_ARTICLES = 3;
export default async function Page(props: { params: { slug: string; lang: LanguageCode; region: string } }) {
	const { slug, lang, region } = props.params;

	const articleResponse = await getArticle(lang, slug);
	const articleData = articleResponse.data.story.content;
	const author: ISbStoryData<StoryblokAuthor> = articleData.author;
	const blogs = await getRelativeArticles(
		author.uuid,
		articleResponse.data.story.id,
		articleData.tags?.map((it) => it.uuid),
		lang,
		NUMBER_OF_RELATIVE_ARTICLES,
	);
	let translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-journal'],
	});

	return (
		<div>
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
					<div className="flex flex-col justify-center p-8 text-left md:order-1 md:w-1/2 md:items-start lg:p-16">
						<div className="flex flex-wrap justify-start gap-2">
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
								{getPublishedDateFormatted(articleResponse.data.story.first_published_at!, lang)}
							</Typography>
						</div>
						<Typography weight="medium" className="mt-8" color="accent" size="5xl">
							{articleData.title}
						</Typography>

						<Link href={`/${lang}/${region}/journal/author/${author.slug}`}>
							<div className="mt-8 flex items-center space-x-4">
								<StoryblokAuthorImage size="large" author={author} lang={lang} region={region} />
								<Typography size="lg" as="span" color="popover" className="ml-1">
									{author.content.fullName}
								</Typography>
							</div>
						</Link>

						<div className="mt-4 flex flex-wrap justify-start gap-2">
							{articleData.tags?.map((tag) => badgeWithLink(lang, region, tag, 'outline'))}
						</div>
					</div>
				</div>

				<div className="prose mx-auto my-4 max-w-2xl content-center p-4 sm:p-6">
					<Typography weight="bold" size="2xl">
						{articleData.leadText}
					</Typography>
					<Typography as="div" className="text-black [&_a]:font-normal">
						{renderWrapper(articleData)}
					</Typography>
					<Separator />

					<div className="mt-4 flex flex-wrap justify-start gap-2">
						{articleData.tags?.map((tag) => badgeWithLink(lang, region, tag, 'default'))}
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
						<Typography size="4xl" className="text-center">
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

import { OriginalLanguageLink } from '@/components/storyblok/OriginalLanguage';
import { StoryblokActionButton } from '@/components/storyblok/StoryblokActionButton';
import { getArticle, getRelativeArticles } from '@/components/storyblok/StoryblokApi';
import { StoryblokArticleCard } from '@/components/storyblok/StoryblokArticle';
import StoryblokAuthorImage from '@/components/storyblok/StoryblokAuthorImage';
import { StoryblokEmbeddedVideoPlayer } from '@/components/storyblok/StoryblokEmbeddedVideoPlayer';
import { StoryblokImageWithCaption } from '@/components/storyblok/StoryblokImageWithCaption';
import { StoryblokReferencesGroup } from '@/components/storyblok/StoryblokReferencesGroup';
import { formatStoryblokDate, formatStoryblokUrl } from '@/components/storyblok/StoryblokUtils';
import { storyblokInitializationWorkaround } from '@/storyblok-init';
import { StoryblokArticle, StoryblokAuthor, StoryblokTag } from '@socialincome/shared/src/storyblok/journal';
import { LanguageCode } from '@socialincome/shared/src/types/language';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { Badge, QuotedText, Separator, Typography } from '@socialincome/ui';
import { ISbStoryData } from '@storyblok/react';
import Image from 'next/image';
import Link from 'next/link';
import { render } from 'storyblok-rich-text-react-renderer';

export const revalidate = 900;
storyblokInitializationWorkaround();

function renderWrapper(articleData: StoryblokArticle, translator: Translator, lang: LanguageCode) {
	return render(articleData.content, {
		blokResolvers: {
			['quotedText']: (props: any) => <QuotedText {...props} />,
			['imageWithCaption']: (props: any) => <StoryblokImageWithCaption {...props} />,
			['embeddedVideo']: (props: any) => <StoryblokEmbeddedVideoPlayer {...props} />,
			['referencesGroup']: (props: any) => <StoryblokReferencesGroup translator={translator} {...props} lang={lang} />,
			['actionButton']: (props: any) => <StoryblokActionButton {...props} />,
		},
	});
}

function badgeWithLink(lang: string, region: string, tag: ISbStoryData<StoryblokTag>, variant: 'outline' | 'default') {
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

export default async function Page(props: { params: Promise<{ slug: string; lang: LanguageCode; region: string }> }) {
	try {
		const { slug, lang, region } = await props.params;
		console.log('📍 Params:', { slug, lang, region });

		const articleResponse = await getArticle(lang, slug);
		console.log('📰 Article Response:', articleResponse);

		const articleData = articleResponse.data?.story?.content;
		if (!articleData) throw new Error('Article content missing');

		console.log('🧾 Article Data:', articleData);

		const author: ISbStoryData<StoryblokAuthor> = articleData.author;
		if (!author) throw new Error('Author missing in article');

		console.log('👤 Author:', author);

		const tagUuids = articleData.tags?.map((it) => it.uuid);
		const blogs = await getRelativeArticles(
			author.uuid,
			articleResponse.data.story.id,
			tagUuids,
			lang,
			NUMBER_OF_RELATIVE_ARTICLES,
		);
		console.log('🧩 Related Articles:', blogs);

		let translator = await Translator.getInstance({
			language: lang,
			namespaces: ['website-journal', 'common'],
		});

		return (
			<div>
				<div className="blog w-full justify-center">
					<div className="bg-primary flex flex-col lg:min-h-screen lg:flex-row">
						<div className="lg:order-2 lg:w-1/2">
							<Image
								src={formatStoryblokUrl(
									articleData.image?.filename,
									ARTICLE_IMAGE_WIDTH,
									ARTICLE_IMAGE_HEIGHT,
									articleData.image?.focus,
								)}
								alt={articleData.image?.alt || ''}
								className="w-full object-cover lg:h-screen"
								width={ARTICLE_IMAGE_WIDTH}
								height={ARTICLE_IMAGE_HEIGHT}
							/>
						</div>
						<div className="flex flex-col justify-center p-8 text-left lg:order-1 lg:w-1/2 lg:items-start lg:p-16">
							<div className="flex flex-wrap justify-start gap-2">
								{articleData.type?.content?.value && (
									<Typography weight="medium" color="popover" size="lg" className="uppercase">
										{articleData.type.content.value}
									</Typography>
								)}
								<Typography size="lg" weight="normal" color="popover" className="ml-5">
									{formatStoryblokDate(articleResponse.data.story.first_published_at, lang)}
								</Typography>
							</div>
							<Typography weight="medium" className="mt-8 hyphens-auto break-words" color="accent" size="5xl">
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
						<Typography as="div" className="text-black [&_a]:font-normal">
							{renderWrapper(articleData, translator, lang)}
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
	} catch (error) {
		console.error('❌ Error rendering Storyblok blog page:', error);
		throw error;
	}
}

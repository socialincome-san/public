import NewsletterGlowContainer from '@/components/newsletter-glow-container/newsletter-glow-container';
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
import classNames from 'classnames';
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
			['newsletterSignup']: (_) => (
				<NewsletterGlowContainer
					lang={lang}
					title={translator.t('popup.information-label')}
					formTranslations={{
						informationLabel: translator.t('popup.information-label'),
						toastSuccess: translator.t('popup.toast-success'),
						toastFailure: translator.t('popup.toast-failure'),
						emailPlaceholder: translator.t('popup.email-placeholder'),
						buttonAddSubscriber: translator.t('popup.button-subscribe'),
					}}
				/>
			),
		},
	});
}

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
export default async function Page(props: { params: Promise<{ slug: string; lang: LanguageCode; region: string }> }) {
	const { slug, lang, region } = await props.params;

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
	const displayImageStyle = !articleData.useImageOnlyForPreview;
	let translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-journal', 'common', 'website-newsletter'],
	});
	return (
		<div>
			<div className="blog w-full justify-center">
				<div className={classNames({ 'bg-primary flex flex-col lg:min-h-screen lg:flex-row': displayImageStyle })}>
					{displayImageStyle && (
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
						className={classNames({
							'flex flex-col justify-center p-8 text-left lg:order-1 lg:w-1/2 lg:items-start lg:p-16':
								displayImageStyle,
							'mx-auto mt-16 max-w-2xl content-center p-4 sm:p-6': !displayImageStyle,
						})}
					>
						<div className="flex flex-wrap justify-start gap-2">
							<Typography
								weight="medium"
								color={displayImageStyle ? 'popover' : 'foreground'}
								size="lg"
								key={articleData.type?.content.id}
								className="uppercase"
							>
								{articleData.type?.content.value}
							</Typography>
							<Typography
								size="lg"
								weight="normal"
								color={displayImageStyle ? 'popover' : 'foreground'}
								className="ml-5"
							>
								{formatStoryblokDate(articleResponse.data.story.first_published_at, lang)}
							</Typography>
						</div>
						<Typography
							weight="medium"
							className="mt-8 hyphens-auto break-words"
							color={displayImageStyle ? 'accent' : 'foreground'}
							size="5xl"
						>
							{articleData.title}
						</Typography>

						<Link href={`/${lang}/${region}/journal/author/${author.slug}`}>
							<div className="mt-8 flex items-center space-x-4">
								<StoryblokAuthorImage size="large" author={author} lang={lang} region={region} />
								<Typography
									weight="semibold"
									size="lg"
									as="span"
									color={displayImageStyle ? 'popover' : 'foreground'}
									className="ml-1"
								>
									{author.content.fullName}
								</Typography>
							</div>
						</Link>

						<div className="mt-4 flex flex-wrap justify-start gap-2">
							{articleData.tags?.map((tag) =>
								badgeWithLink(lang, region, tag, displayImageStyle ? 'outline' : 'foreground'),
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
					<Typography as="div" className="text-black [&_a]:font-normal">
						{renderWrapper(articleData, translator, lang)}
					</Typography>
					<Separator />

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

import {
	getPublishedDateFormatted,
	loadArticleWithFallbackToDefaultLanguage,
} from '@/app/[lang]/[region]/(website)/journal/StoryblokApi';
import StoryblokAuthorImage from '@/app/[lang]/[region]/(website)/journal/StoryblokAuthorImage';
import { LanguageCode } from '@socialincome/shared/src/types/language';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { Badge, Typography } from '@socialincome/ui';
import Image from 'next/image';
import { render } from 'storyblok-rich-text-react-renderer';

export const revalidate = 900;

export default async function Page(props: { params: { slug: string[]; lang: LanguageCode; region: string } }) {
	const lang = props.params.lang;

	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-journal'],
	});

	const loadArticleResponse = await loadArticleWithFallbackToDefaultLanguage(props.params.lang, props.params.slug);
	const articleData = loadArticleResponse.data.story.content;
	const author = articleData.author.content;

	return (
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
				<div className="flex flex-col items-center justify-center p-8 text-center md:order-1 md:w-1/2 md:items-start md:text-left lg:p-16">
					<div className="flex flex-wrap justify-center gap-2 md:justify-start">
						{articleData.topics?.map((topic) => (
							<Badge key={topic.slug} variant="white" className="mb-2">
								{topic.content.value}
							</Badge>
						))}
					</div>
					<Typography className="mt-4" color="accent" size="5xl">
						{articleData.title}
					</Typography>
					<div className="mt-7 flex items-center space-x-4">
						<StoryblokAuthorImage author={author} />
						<div className="text-left">
							<Typography color="popover" size="sm">
								{translator.t('published')}{' '}
								{getPublishedDateFormatted(loadArticleResponse.data.story.published_at!, lang)}
							</Typography>
							<Typography color="popover" size="sm">
								{translator.t('written-by')}
								<Typography as="span" color={'accent'} className="ml-1">
									{author.fullName}
								</Typography>
							</Typography>
						</div>
					</div>
				</div>
			</div>

			<div className="prose mx-auto my-10 max-w-2xl content-center p-4 sm:p-6">{render(articleData.content)}</div>
		</div>
	);
}

import {
	getPublishedDateFormatted,
	loadArticleWithFallbackToDefaultLanguage,
} from '@/app/[lang]/[region]/(website)/journal/StoryblokApi';
import StoryblokAuthorImage from '@/app/[lang]/[region]/(website)/journal/StoryblokAuthorImage';
import { LanguageCode } from '@socialincome/shared/src/types/language';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { Separator, Typography } from '@socialincome/ui';
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
						<Typography
							weight="medium"
							color="popover"
							size="lg"
							key={articleData.topics[0].content.id}
							className="uppercase"
						>
							{articleData.topics[0].content.value}
						</Typography>
						<Typography size="lg" weight="normal" color="popover" className="ml-4">
							{getPublishedDateFormatted(loadArticleResponse.data.story.published_at!, lang)}
						</Typography>
					</div>
					<Typography weight="medium" className="mt-8" color="accent" size="5xl">
						{articleData.title}
					</Typography>
					<div className="mt-8 flex items-center space-x-4">
						<StoryblokAuthorImage size="large" author={author} />

						<Typography size="lg" as="span" color={'popover'} className="ml-1">
							{author.fullName}
						</Typography>
					</div>
				</div>
			</div>

			<div className="prose mx-auto my-4 max-w-2xl content-center p-4 sm:p-6">
				<Typography weight="bold" size="2xl">
					{articleData.leadText}
				</Typography>
				<Typography as="div" className="text-black">
					{render(articleData.content)}
				</Typography>
				<Separator />
				<div className="mt-6 flex items-center space-x-4">
					<StoryblokAuthorImage size="large" author={author} />
					<Typography size="lg" as="span" className="ml-1" color="primary">
						{author.fullName}
					</Typography>
				</div>
			</div>
		</div>
	);
}

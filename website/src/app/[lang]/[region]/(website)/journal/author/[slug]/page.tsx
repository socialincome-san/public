import { MoreArticlesLink } from '@/components/storyblok/MoreArticlesLink';
import {
	getArticleCountByAuthorForDefaultLang,
	getArticlesByAuthor,
	getAuthor,
} from '@/components/storyblok/StoryblokApi';
import { StoryblokArticleCard } from '@/components/storyblok/StoryblokArticle';
import StoryblokAuthorImage from '@/components/storyblok/StoryblokAuthorImage';
import { defaultLanguage } from '@/lib/i18n/utils';
import { storyblokInitializationWorkaround } from '@/storyblok-init';
import { LanguageCode } from '@socialincome/shared/src/types/language';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Separator, Typography } from '@socialincome/ui';

export const revalidate = 900;
storyblokInitializationWorkaround();

async function getTotalArticlesInDefaultLanguage(
	lang: string,
	totalArticlesInSelectedLanguage: number,
	authorId: string,
) {
	return lang == defaultLanguage
		? totalArticlesInSelectedLanguage
		: await getArticleCountByAuthorForDefaultLang(authorId);
}

export default async function Page(props: { params: Promise<{ slug: string; lang: LanguageCode; region: string }> }) {
	const { slug, lang, region } = await props.params;
	const author = (await getAuthor(slug, lang)).data.story;

	const authorId = author.uuid;
	const blogsResponse = await getArticlesByAuthor(authorId, lang);

	const blogs = blogsResponse.data.stories;
	const totalArticlesInSelectedLanguage = blogsResponse.total;
	const totalArticlesInDefault = await getTotalArticlesInDefaultLanguage(
		lang,
		totalArticlesInSelectedLanguage,
		authorId,
	);
	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-journal', 'common'] });
	return (
		<BaseContainer>
			<div className="mx-auto mb-20 mt-8 flex max-w-6xl justify-center gap-4">
				<StoryblokAuthorImage
					author={author}
					size="extra-large"
					className="h-24 w-24 rounded-full object-cover"
					lang={lang}
					region={region}
				/>

				<div>
					<Typography weight="bold" size="4xl">
						{author.content.fullName}
					</Typography>
					<Typography className="mt-2 text-black">{author.content.bio}</Typography>
				</div>
			</div>

			<div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
				{blogs.map((blog) => (
					<StoryblokArticleCard key={blog.uuid} lang={lang} region={region} blog={blog} author={author} />
				))}
			</div>

			{totalArticlesInDefault > totalArticlesInSelectedLanguage && (
				<div>
					<Separator className="my-8" />
					<MoreArticlesLink text={translator.t('overview.more-articles')} />
				</div>
			)}
		</BaseContainer>
	);
}

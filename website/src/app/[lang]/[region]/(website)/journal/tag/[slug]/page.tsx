import { DefaultParams } from '@/app/[lang]/[region]';
import { MoreArticlesLink } from '@/components/storyblok/MoreArticlesLink';
import {
	DEFAULT_LANGUAGE,
	getArticleCountByTagForDefaultLang,
	getArticlesByTag,
	getTag,
} from '@/components/storyblok/StoryblokApi';
import { StoryblokArticleCard } from '@/components/storyblok/StoryblokArticle';
import { storyblokInitializationWorkaround } from '@/storyblok-init';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Separator, Typography } from '@socialincome/ui';

export const revalidate = 900;
storyblokInitializationWorkaround();

interface PageParams extends DefaultParams {
	slug: string;
}

interface PageProps {
	params: Promise<PageParams>;
}

async function getTotalArticlesInDefault(lang: string, tagId: string, totalArticlesInSelectedLanguage: number) {
	return lang == DEFAULT_LANGUAGE ? totalArticlesInSelectedLanguage : await getArticleCountByTagForDefaultLang(tagId);
}

export default async function Page({ params }: PageProps) {
	const { slug, lang, region } = await params;

	const tag = (await getTag(slug, lang)).data.story;
	const blogsResponse = await getArticlesByTag(tag.uuid, lang);
	const blogs = blogsResponse.data.stories;
	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-journal', 'common'] });
	const totalArticlesInSelectedLanguage = blogsResponse.total;
	const totalArticlesInDefault = await getTotalArticlesInDefault(lang, tag.uuid, totalArticlesInSelectedLanguage);
	return (
		<BaseContainer>
			<div className="mx-auto mb-20 mt-8 flex max-w-6xl justify-center gap-4">
				<div>
					<Typography weight="bold" size="4xl">
						{tag.content.value}
					</Typography>
					<Typography className="mt-2 text-black">{tag.content.description}</Typography>
				</div>
			</div>

			<div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
				{blogs.map((blog) => (
					<StoryblokArticleCard key={blog.uuid} lang={lang} region={region} blog={blog} author={blog.content.author} />
				))}
			</div>

			<Separator className="my-8" />
			{totalArticlesInDefault > totalArticlesInSelectedLanguage && (
				<MoreArticlesLink
					text={translator.t('overview.more-articles')}
					url={`/${DEFAULT_LANGUAGE}/${region}/journal/tag/${slug}`}
				/>
			)}
		</BaseContainer>
	);
}

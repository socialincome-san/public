import { getArticlesByTag, getTag } from '@/app/[lang]/[region]/(website)/journal/StoryblokApi';
import { StoryblokArticleCard } from '@/app/[lang]/[region]/(website)/journal/StoryblokArticle';
import { LanguageCode } from '@socialincome/shared/src/types/language';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';

export const revalidate = 900;

export default async function Page(props: { params: { slug: string; lang: LanguageCode; region: string } }) {
	const { slug, lang, region } = props.params;
	const tag = (await getTag(slug, lang)).data.story;
	const blogsResponse = await getArticlesByTag(tag.uuid, lang);

	const blogs = blogsResponse.data.stories;
	await Translator.getInstance({
		language: lang,
		namespaces: ['website-journal'],
	});
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
		</BaseContainer>
	);
}

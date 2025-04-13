import { getArticlesByAuthor, getAuthor } from '@/app/[lang]/[region]/(website)/journal/StoryblokApi';
import { StoryblokArticleCard } from '@/app/[lang]/[region]/(website)/journal/StoryblokArticle';
import StoryblokAuthorImage from '@/app/[lang]/[region]/(website)/journal/StoryblokAuthorImage';
import { LanguageCode } from '@socialincome/shared/src/types/language';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';

export const revalidate = 900;

export default async function Page(props: { params: { slug: string; lang: LanguageCode; region: string } }) {
	const { slug, lang, region } = props.params;
	const author = (await getAuthor(slug, lang)).data.story;

	const blogsResponse = await getArticlesByAuthor(author.uuid, lang);

	const blogs = blogsResponse.data.stories;
	await Translator.getInstance({
		language: lang,
		namespaces: ['website-journal'],
	});
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
		</BaseContainer>
	);
}

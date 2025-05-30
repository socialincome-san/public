import { DefaultParams } from '@/app/[lang]/[region]';
import { getArticlesByTag, getTag } from '@/components/storyblok/StoryblokApi';
import { StoryblokArticleCard } from '@/components/storyblok/StoryblokArticle';
import { storyblokInitializationWorkaround } from '@/storyblok-init';
import { BaseContainer, Typography } from '@socialincome/ui';

export const revalidate = 900;
storyblokInitializationWorkaround();

interface PageParams extends DefaultParams {
	slug: string;
}

interface PageProps {
	params: Promise<PageParams>;
}

export default async function Page({ params }: PageProps) {
	const { slug, lang, region } = await params;

	const tag = (await getTag(slug, lang)).data.story;
	const blogsResponse = await getArticlesByTag(tag.uuid, lang);
	const blogs = blogsResponse.data.stories;

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

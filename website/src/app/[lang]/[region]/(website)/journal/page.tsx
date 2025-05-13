import { DefaultPageProps } from '@/app/[lang]/[region]';
import { getAuthors, getOverviewArticles, getTags } from '@/app/[lang]/[region]/(website)/journal/StoryblokApi';
import { StoryblokArticleCard } from '@/app/[lang]/[region]/(website)/journal/StoryblokArticle';
import StoryblokAuthorImage from '@/app/[lang]/[region]/(website)/journal/StoryblokAuthorImage';
import { storyblokInitializationWorkaround } from '@/storyblok-init';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { Badge, BaseContainer, Typography } from '@socialincome/ui';
import Link from 'next/link';

export const revalidate = 900;
storyblokInitializationWorkaround();

export default async function Page({ params }: DefaultPageProps) {
	const { lang, region } = await params;
	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-journal'] });

	const [blogsResponse, authorsResponse, tagsResponse] = await Promise.all([
		getOverviewArticles(lang),
		getAuthors(lang),
		getTags(lang),
	]);
	const blogs = blogsResponse.data.stories;
	const authors = authorsResponse.data.stories;
	const tags = tagsResponse.data.stories;

	return (
		<BaseContainer>
			<Typography weight="bold" className="text-center" size="5xl">
				{translator.t('overview.title')}
			</Typography>
			<Typography className="mt-8 text-center text-black" size="xl">
				{translator.t('overview.description')}
			</Typography>
			<Typography className="mb-4 mt-12 text-center" size="3xl" weight="medium">
				{translator.t('overview.editors')}
			</Typography>
			<div className="mx-auto mb-10 grid max-w-lg grid-cols-[repeat(auto-fit,minmax(60px,1fr))] place-items-center gap-2">
				{authors.map((author, index) => (
					<div key={index} className="flex flex-col justify-center text-center">
						<Link href={`/${lang}/${region}/journal/author/${author.slug}`}>
							<StoryblokAuthorImage className="mb-1" author={author} size="extra-large" lang={lang} region={region} />

							<Typography>{author.content.firstName}</Typography>
							<Typography>{author.content.lastName}</Typography>
						</Link>
					</div>
				))}
			</div>

			<div className="mt-16 flex grid-cols-3 justify-start gap-1">
				<Badge size="md" key={'overview'} variant="default" className="mb-2">
					{translator.t('overview.all')}
				</Badge>
				{tags.map((tag) => (
					<Link key={tag.slug} href={`/${lang}/${region}/journal/tag/${tag.slug}`}>
						<Badge size="md" variant="outline" className="mb-2">
							{tag.content?.value}
						</Badge>
					</Link>
				))}
			</div>

			<div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
				{blogs.map((blog) => (
					<StoryblokArticleCard lang={lang} region={region} blog={blog} author={blog.content.author} key={blog.uuid} />
				))}
			</div>
		</BaseContainer>
	);
}

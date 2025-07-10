import { DefaultPageProps } from '@/app/[lang]/[region]';
import { MoreArticlesLink } from '@/components/storyblok/MoreArticlesLink';
import {
	DEFAULT_LANGUAGE,
	getAuthors,
	getOverviewArticles,
	getOverviewArticlesCountForDefaultLang,
	getTags,
} from '@/components/storyblok/StoryblokApi';
import { StoryblokArticleCard } from '@/components/storyblok/StoryblokArticle';
import StoryblokAuthorImage from '@/components/storyblok/StoryblokAuthorImage';
import { storyblokInitializationWorkaround } from '@/storyblok-init';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { Badge, BaseContainer, Separator, Typography } from '@socialincome/ui';
import Link from 'next/link';

export const revalidate = 900;
storyblokInitializationWorkaround();

export default async function Page({ params }: DefaultPageProps) {
	const { lang, region } = await params;
	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-journal', 'common'] });

	const [blogsResponse, authorsResponse, tagsResponse] = await Promise.all([
		getOverviewArticles(lang),
		getAuthors(lang),
		getTags(lang),
	]);
	const blogs = blogsResponse.data.stories;
	const totalArticlesInSelectedLanguage = blogsResponse.total;
	const totalArticlesInDefaultLang =
		lang == DEFAULT_LANGUAGE ? totalArticlesInSelectedLanguage : await getOverviewArticlesCountForDefaultLang();
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

			<div className="mt-16 flex flex-wrap gap-2">
				<div>
					<Badge size="md" key="overview" variant="default" className="whitespace-nowrap">
						{translator.t('overview.all')}
					</Badge>
				</div>
				{tags.map((tag) => (
					<Link key={tag.slug} href={`/${lang}/${region}/journal/tag/${tag.slug}`}>
						<Badge size="md" variant="outline" className="whitespace-nowrap">
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

			{totalArticlesInDefaultLang > totalArticlesInSelectedLanguage && (
				<div>
					<Separator className="my-8" />
					<MoreArticlesLink
						text={translator.t('overview.more-articles')}
						url={`/${DEFAULT_LANGUAGE}/${region}/journal`}
					/>
				</div>
			)}
		</BaseContainer>
	);
}

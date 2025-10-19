import { DefaultPageProps } from '@/app/[lang]/[region]';
import { MoreArticlesLink } from '@/components/legacy/storyblok/MoreArticlesLink';
import {
	getOverviewArticles,
	getOverviewArticlesCountForDefaultLang,
	getOverviewAuthors,
	getOverviewTags
} from '@/components/legacy/storyblok/StoryblokApi';
import { StoryblokArticleCard } from '@/components/legacy/storyblok/StoryblokArticle';
import StoryblokAuthorImage from '@/components/legacy/storyblok/StoryblokAuthorImage';
import { defaultLanguage } from '@/lib/i18n/utils';
import { storyblokInitializationWorkaround } from '@/storyblok-init';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { Badge, BaseContainer, Carousel, CarouselContent, Separator, Typography } from '@socialincome/ui';
import Link from 'next/link';

export const revalidate = 900;
storyblokInitializationWorkaround();

export default async function Page({ params }: DefaultPageProps) {
	const { lang, region } = await params;
	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-journal', 'common'] });

	const [blogs, authors, tags] = await Promise.all([
		getOverviewArticles(lang),
		getOverviewAuthors(lang),
		getOverviewTags(lang),
	]);


	const totalArticlesInDefaultLang =
		lang == defaultLanguage ? blogs.length : await getOverviewArticlesCountForDefaultLang();



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
			<Carousel
				className="mx-auto mb-10 max-w-lg"
				options={{
					loop: true,
					autoPlay: { enabled: true, delay: 5000 },
				}}
				showControls
			>
				{authors.map((author) => (
					<CarouselContent key={author.id} className="mx-1 flex flex-col justify-center text-center">
						<Link
							href={`/${lang}/${region}/journal/author/${author.slug}`}
							title={`${author.content.firstName} ${author.content.lastName}`}
						>
							<StoryblokAuthorImage
								className="mx-auto mb-1"
								author={author}
								size="extra-large"
								lang={lang}
								region={region}
							/>
							<div className="line-clamp-2 max-w-24 overflow-hidden break-words">
								<Typography>{author.content.firstName}</Typography>
								<Typography>{author.content.lastName}</Typography>
							</div>
						</Link>
					</CarouselContent>
				))}
			</Carousel>

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

			{totalArticlesInDefaultLang > blogs.length && (
				<div>
					<Separator className="my-8" />
					<MoreArticlesLink text={translator.t('overview.more-articles')} />
				</div>
			)}
		</BaseContainer>
	);
}

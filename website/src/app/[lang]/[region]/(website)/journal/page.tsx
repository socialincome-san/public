import { DefaultPageProps } from '@/app/[lang]/[region]';
import { MoreArticlesLink } from '@/components/legacy/storyblok/MoreArticlesLink';
import { StoryblokArticleCard } from '@/components/legacy/storyblok/StoryblokArticle';
import StoryblokAuthorImage from '@/components/legacy/storyblok/StoryblokAuthorImage';
import { Translator } from '@/lib/i18n/translator';
import { defaultLanguage, WebsiteLanguage } from '@/lib/i18n/utils';
import { StoryblokService } from '@/lib/services/storyblok/storyblok.service';
import { Badge, BaseContainer, Carousel, CarouselContent, Separator, Typography } from '@socialincome/ui';
import Link from 'next/link';

export const revalidate = 900;

const storyblokService = new StoryblokService();

export default async function Page({ params }: DefaultPageProps) {
	const { lang, region } = await params;

	const translator = await Translator.getInstance({
		language: lang as WebsiteLanguage,
		namespaces: ['website-journal', 'common'],
	});

	const [articlesResult, authorsResult, tagsResult] = await Promise.all([
		storyblokService.getOverviewArticles(lang),
		storyblokService.getOverviewAuthors(lang),
		storyblokService.getOverviewTags(lang),
	]);

	const articles = articlesResult.success ? articlesResult.data : [];
	const authors = authorsResult.success ? authorsResult.data : [];
	const tags = tagsResult.success ? tagsResult.data : [];

	let totalArticlesInDefaultLang = articles.length;

	if (lang !== defaultLanguage) {
		const countRes = await storyblokService.getOverviewArticlesCountForDefaultLang();
		if (countRes.success) {
			totalArticlesInDefaultLang = countRes.data;
		}
	}

	return (
		<BaseContainer>
			<Typography weight="bold" className="text-center" size="5xl">
				{translator.t('overview.title')}
			</Typography>

			<Typography className="mt-8 text-center text-black" size="xl">
				{translator.t('overview.description')}
			</Typography>

			<Typography className="mt-12 mb-4 text-center" size="3xl" weight="medium">
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
							<div className="line-clamp-2 max-w-24 overflow-hidden wrap-break-word">
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
				{articles.map((article) => (
					<StoryblokArticleCard lang={lang} region={region} article={article} key={article.uuid} />
				))}
			</div>

			{totalArticlesInDefaultLang > articles.length && (
				<div>
					<Separator className="my-8" />
					<MoreArticlesLink text={translator.t('overview.more-articles')} />
				</div>
			)}
		</BaseContainer>
	);
}

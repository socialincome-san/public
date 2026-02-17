import { DefaultParams } from '@/app/[lang]/[region]';
import { MoreArticlesLink } from '@/components/legacy/storyblok/MoreArticlesLink';
import { StoryblokArticleCard } from '@/components/legacy/storyblok/StoryblokArticle';
import { Translator } from '@/lib/i18n/translator';
import { defaultLanguage, WebsiteLanguage } from '@/lib/i18n/utils';
import { StoryblokService } from '@/lib/services/storyblok/storyblok.service';
import { BaseContainer, Separator, Typography } from '@socialincome/ui';

export const revalidate = 900;

interface PageParams extends DefaultParams {
	slug: string;
}

interface PageProps {
	params: Promise<PageParams>;
}

const storyblokService = new StoryblokService();

async function getTotalArticlesInDefault(lang: string, tagId: string, totalArticlesInSelectedLanguage: number) {
	if (lang == defaultLanguage) {
		return totalArticlesInSelectedLanguage;
	}

	const res = await storyblokService.getArticleCountByTagForDefaultLang(tagId);
	return res.success ? res.data : totalArticlesInSelectedLanguage;
}

export default async function Page({ params }: PageProps) {
	const { slug, lang, region } = await params;

	const tagResult = await storyblokService.getTag(slug, lang);
	if (!tagResult.success) {
		return null;
	}
	const tag = tagResult.data;

	const articlesResult = await storyblokService.getArticlesByTag(tag.uuid, lang);
	const articles = articlesResult.success ? articlesResult.data : [];

	const translator = await Translator.getInstance({
		language: lang as WebsiteLanguage,
		namespaces: ['website-journal', 'common'],
	});

	const totalArticlesInSelectedLanguage = articles.length;

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
				{articles.map((article) => (
					<StoryblokArticleCard key={article.uuid} lang={lang} region={region} article={article} />
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

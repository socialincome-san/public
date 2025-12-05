import { DefaultParams } from '@/app/[lang]/[region]';
import { MoreArticlesLink } from '@/components/legacy/storyblok/MoreArticlesLink';
import {
	getArticleCountByTagForDefaultLang,
	getArticlesByTag,
	getTag,
} from '@/components/legacy/storyblok/StoryblokApi';
import { StoryblokArticleCard } from '@/components/legacy/storyblok/StoryblokArticle';
import { defaultLanguage, WebsiteLanguage } from '@/lib/i18n/utils';
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
	return lang == defaultLanguage ? totalArticlesInSelectedLanguage : await getArticleCountByTagForDefaultLang(tagId);
}

export default async function Page({ params }: PageProps) {
	const { slug, lang, region } = await params;

	const tag = (await getTag(slug, lang)).data.story;
	const articles = await getArticlesByTag(tag.uuid, lang);
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
					<StoryblokArticleCard
						key={article.uuid}
						lang={lang}
						region={region}
						article={article}
						author={article.content.author}
					/>
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

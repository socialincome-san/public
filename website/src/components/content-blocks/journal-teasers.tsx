import { BlockWrapper } from '@/components/block-wrapper';
import { Button } from '@/components/button';
import { JournalTeaserCard } from '@/components/journal-teaser-card';
import { JournalTeasers } from '@/generated/storyblok/types/109655/storyblok-components';
import { Translator } from '@/lib/i18n/translator';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { cn } from '@/lib/utils/cn';
import { storyblokEditable, type SbBlokData } from '@storyblok/react';
import Link from 'next/link';
import Markdown from 'react-markdown';

const MAX_ARTICLES = 3;

type Props = {
	blok: JournalTeasers;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
};

const getSelectedArticleUuids = (selectedArticles: JournalTeasers['selectedArticles']) => {
	if (!selectedArticles?.length) {
		return [];
	}
	const uuids = selectedArticles
		.map((article) => (typeof article === 'string' ? article : article.uuid))
		.filter((uuid): uuid is string => Boolean(uuid));
	return [...new Set(uuids)].slice(0, MAX_ARTICLES);
};

const getArticles = async (blok: JournalTeasers, lang: WebsiteLanguage) => {
	const { StoryblokService } = await import('@/lib/services/storyblok/storyblok.service');
	const storyblokService = new StoryblokService();

	if (blok.articlesDisplayMode === 'selected') {
		const articleUuids = getSelectedArticleUuids(blok.selectedArticles);
		if (!articleUuids.length) {
			return [];
		}
		const selectedResult = await storyblokService.getArticlesByUuids(lang, articleUuids);
		return selectedResult.success ? selectedResult.data.slice(0, MAX_ARTICLES) : [];
	}

	const latestResult = await storyblokService.getOverviewArticles(lang, undefined, MAX_ARTICLES);
	return latestResult.success ? latestResult.data.slice(0, MAX_ARTICLES) : [];
};

export const JournalTeasersBlock = async ({ blok, lang, region }: Props) => {
	const { heading } = blok;
	const [translator, articles] = await Promise.all([
		Translator.getInstance({
			language: lang,
			namespaces: 'website-journal',
		}),
		getArticles(blok, lang),
	]);

	if (!articles.length) {
		return null;
	}

	const [featuredArticle, ...secondaryArticles] = articles;
	const hasSecondaryArticles = secondaryArticles.length > 0;

	return (
		<BlockWrapper {...storyblokEditable(blok as SbBlokData)}>
			<div className="mb-6 flex flex-col justify-between gap-4 md:mb-8 md:flex-row md:items-center">
				{heading && (
					<h2 className="text-4xl xl:text-5xl [&_strong]:font-bold">
						<Markdown components={{ p: ({ children }) => <>{children}</> }}>{heading}</Markdown>
					</h2>
				)}
				<div>
					<Button variant="outline" asChild>
						<Link href={`/${lang}/${region}/journal`}>{translator.t('teasers.goToJournal')}</Link>
					</Button>
				</div>
			</div>

			<div className={cn('grid grid-cols-1 gap-4 lg:gap-8', hasSecondaryArticles && 'lg:grid-cols-2')}>
				<JournalTeaserCard article={featuredArticle} lang={lang} region={region} isFeatured />
				{hasSecondaryArticles && (
					<div
						className={cn('grid h-full grid-cols-1 gap-4 lg:gap-8', secondaryArticles.length > 1 && 'lg:grid-rows-2')}
					>
						{secondaryArticles.map((article) => (
							<JournalTeaserCard key={article.uuid} article={article} lang={lang} region={region} isFeatured={false} />
						))}
					</div>
				)}
			</div>
		</BlockWrapper>
	);
};

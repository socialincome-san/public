import { JournalTeasersSection } from '@/components/journal/journal-teasers-section';
import { StoryblokMarkdown } from '@/components/storyblok-markdown';
import { JournalTeasers } from '@/generated/storyblok/types/109655/storyblok-components';
import { Translator } from '@/lib/i18n/translator';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import { StoryblokService } from '@/lib/services/storyblok/storyblok.service';
import type { SbBlokData } from '@storyblok/react';

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

	return [...new Set(uuids)].slice(0, StoryblokService.journalTeaserLimit);
};

const getArticles = async (blok: JournalTeasers, lang: WebsiteLanguage) => {
	if (blok.articlesDisplayMode === 'selected') {
		const articleUuids = getSelectedArticleUuids(blok.selectedArticles);
		if (!articleUuids.length) {
			return [];
		}

		const selectedResult = await services.storyblok.getArticlesByUuids(lang, articleUuids);

		return selectedResult.success ? selectedResult.data.slice(0, StoryblokService.journalTeaserLimit) : [];
	}

	const latestResult = await services.storyblok.getLatestJournalArticles(lang);

	return latestResult.success ? latestResult.data : [];
};

export const JournalTeasersBlock = async ({ blok, lang, region }: Props) => {
	const { disableMarginBottom, disableMarginTop, heading } = blok;
	const [translator, articles] = await Promise.all([
		Translator.getInstance({ language: lang, namespaces: ['website-journal'] }),
		getArticles(blok, lang),
	]);

	if (!articles.length) {
		return null;
	}

	return (
		<JournalTeasersSection
			heading={heading ? <StoryblokMarkdown>{heading}</StoryblokMarkdown> : undefined}
			articles={articles}
			lang={lang}
			region={region}
			journalCtaLabel={translator.t('teasers.goToJournal')}
			videoLabel={translator.t('badge.video')}
			blok={blok as SbBlokData}
			disableMarginBottom={disableMarginBottom}
			disableMarginTop={disableMarginTop}
		/>
	);
};

import { JournalTeasersSection } from '@/components/journal/journal-teasers-section';
import { StoryblokMarkdown } from '@/components/storyblok-markdown';
import { JournalTeasers } from '@/generated/storyblok/types/109655/storyblok-components';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { getJournalArticlesByUuidsAction, getLatestJournalArticlesAction } from '@/modules/journal/journal.actions';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import { storyblokEditable } from '@storyblok/react';
import { getTranslations } from 'next-intl/server';

const JOURNAL_TEASER_LIMIT = 3;

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

	return [...new Set(uuids)].slice(0, JOURNAL_TEASER_LIMIT);
};

const getArticles = async (blok: JournalTeasers, lang: WebsiteLanguage) => {
	if (blok.articlesDisplayMode === 'selected') {
		const articleUuids = getSelectedArticleUuids(blok.selectedArticles);
		if (!articleUuids.length) {
			return [];
		}

		const selectedResult = await getJournalArticlesByUuidsAction({ language: lang, articleUuids });

		return selectedResult.success ? selectedResult.data.slice(0, JOURNAL_TEASER_LIMIT) : [];
	}

	const latestResult = await getLatestJournalArticlesAction(lang);

	return latestResult.success ? latestResult.data : [];
};

export const JournalTeasersBlock = async ({ blok, lang, region }: Props) => {
	const { disableMarginBottom, disableMarginTop, heading } = blok;
	const [t, articles] = await Promise.all([getTranslations('website-journal'), getArticles(blok, lang)]);

	if (!articles.length) {
		return null;
	}

	return (
		<BlockWrapper
			disableMarginBottom={disableMarginBottom}
			disableMarginTop={disableMarginTop}
			{...(blok ? storyblokEditable(blok) : {})}
		>
			<JournalTeasersSection
				heading={heading ? <StoryblokMarkdown>{heading}</StoryblokMarkdown> : undefined}
				articles={articles}
				lang={lang}
				region={region}
				journalCtaLabel={t('teasers.goToJournal')}
				videoLabel={t('badge.video')}
			/>
		</BlockWrapper>
	);
};

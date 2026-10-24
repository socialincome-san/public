import { blockMargins } from '@/components/content-blocks/block-margins';
import { JournalTeasersSection } from '@/components/journal/journal-teasers-section';
import { StoryblokMarkdown } from '@/components/storyblok-markdown';
import { JournalTeasers } from '@/generated/storyblok/types/109655/storyblok-components';
import { WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import {
	getJournalArticlesByUuidsAction,
	getLatestJournalArticlesAction,
	getLatestJournalArticlesByTagAction,
} from '@/modules/journal/journal.actions';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import { storyblokEditable } from '@storyblok/react';
import { getTranslations } from 'next-intl/server';

const JOURNAL_TEASER_LIMIT = 3;

type Props = {
	blok: JournalTeasers;
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
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

// `tag` is a single-option field referencing a tag story: a uuid, or the story once resolved.
const getTagUuid = (tag: unknown) => {
	if (typeof tag === 'string') {
		return tag;
	}
	if (typeof tag === 'object' && tag !== null && 'uuid' in tag && typeof tag.uuid === 'string') {
		return tag.uuid;
	}

	return undefined;
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

	const tagUuid = getTagUuid(blok.tag);
	const latestResult = tagUuid
		? await getLatestJournalArticlesByTagAction({ language: lang, tagUuid })
		: await getLatestJournalArticlesAction(lang);

	return latestResult.success ? latestResult.data : [];
};

export const JournalTeasersBlock = async ({ blok, lang, currency }: Props) => {
	const { heading } = blok;
	const [t, articles] = await Promise.all([getTranslations('website-journal'), getArticles(blok, lang)]);

	if (!articles.length) {
		return null;
	}

	return (
		<BlockWrapper {...blockMargins(blok)} {...storyblokEditable(blok)}>
			<JournalTeasersSection
				heading={heading ? <StoryblokMarkdown>{heading}</StoryblokMarkdown> : undefined}
				articles={articles}
				lang={lang}
				currency={currency}
				journalCtaLabel={t('teasers.goToJournal')}
				videoLabel={t('badge.video')}
			/>
		</BlockWrapper>
	);
};

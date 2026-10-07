import { JournalTeasersSection } from '@/components/journal/journal-teasers-section';
import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { getLatestJournalArticlesAction } from '@/modules/journal/journal.actions';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';

type Props = {
	lang: WebsiteLanguage;
	region: WebsiteRegion;
};

export const CampaignJournalTeaser = async ({ lang, region }: Props) => {
	const [translator, articlesResult] = await Promise.all([
		Translator.getInstance({ language: lang, namespaces: ['website-journal'] }),
		getLatestJournalArticlesAction(lang),
	]);

	const articles = articlesResult.success ? articlesResult.data : [];

	if (articles.length === 0) {
		return null;
	}

	return (
		<BlockWrapper marginTop="none" marginBottom="none">
			<JournalTeasersSection
				heading={
					<>
						{translator.t('teasers.heading-prefix')}
						<strong>{translator.t('teasers.heading-emphasis')}</strong>
					</>
				}
				articles={articles}
				lang={lang}
				region={region}
				journalCtaLabel={translator.t('teasers.goToJournal')}
				videoLabel={translator.t('badge.video')}
			/>
		</BlockWrapper>
	);
};

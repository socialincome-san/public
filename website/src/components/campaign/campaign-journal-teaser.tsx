import { JournalTeasersSection } from '@/components/journal/journal-teasers-section';
import type { WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { getLatestJournalArticlesAction } from '@/modules/journal/journal.actions';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import { getTranslations } from 'next-intl/server';

type Props = {
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
};

export const CampaignJournalTeaser = async ({ lang, currency }: Props) => {
	const [t, articlesResult] = await Promise.all([getTranslations('website-journal'), getLatestJournalArticlesAction(lang)]);

	const articles = articlesResult.success ? articlesResult.data : [];

	if (articles.length === 0) {
		return null;
	}

	return (
		<BlockWrapper disableMarginTop={true} disableMarginBottom={true}>
			<JournalTeasersSection
				heading={
					<>
						{t('teasers.heading-prefix')}
						<strong>{t('teasers.heading-emphasis')}</strong>
					</>
				}
				articles={articles}
				lang={lang}
				currency={currency}
				journalCtaLabel={t('teasers.goToJournal')}
				videoLabel={t('badge.video')}
			/>
		</BlockWrapper>
	);
};

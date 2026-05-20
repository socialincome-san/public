import { JournalTeasersSection } from '@/components/journal/journal-teasers-section';
import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { getLatestJournalArticlesAction } from '@/lib/server-actions/journal-actions';

type Props = {
	lang: WebsiteLanguage;
	region: WebsiteRegion;
};

export const CampaignJournalTeaser = async ({ lang, region }: Props) => {
	const [translator, articles] = await Promise.all([
		Translator.getInstance({ language: lang, namespaces: ['website-journal'] }),
		getLatestJournalArticlesAction(lang),
	]);

	if (articles.length === 0) {
		return null;
	}

	return (
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
		/>
	);
};

import { JournalTeasersSection } from '@/components/journal/journal-teasers-section';
import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';

type Props = {
	lang: WebsiteLanguage;
	region: WebsiteRegion;
};

export const CampaignJournalTeaser = async ({ lang, region }: Props) => {
	const [translator, articlesResult] = await Promise.all([
		Translator.getInstance({ language: lang, namespaces: ['website-journal'] }),
		services.storyblok.getLatestJournalArticles(lang),
	]);

	const articles = articlesResult.success ? articlesResult.data : [];

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

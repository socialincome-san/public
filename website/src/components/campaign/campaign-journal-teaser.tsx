import { BlockWrapper } from '@/components/block-wrapper';
import { JournalTeasersSection } from '@/components/journal/journal-teasers-section';
import { Translator } from '@/lib/i18n/translator';
import { getWebsiteRootParams } from '@/lib/i18n/website-root-params';
import { services } from '@/lib/services/services';

export const CampaignJournalTeaser = async () => {
	const { lang } = await getWebsiteRootParams();
	const [translator, articlesResult] = await Promise.all([
		Translator.getInstance({ language: lang, namespaces: ['website-journal'] }),
		services.storyblok.getLatestJournalArticles(lang),
	]);

	const articles = articlesResult.success ? articlesResult.data : [];

	if (articles.length === 0) {
		return null;
	}

	return (
		<BlockWrapper disableMarginTop={true} disableMarginBottom={true}>
			<JournalTeasersSection
				heading={
					<>
						{translator.t('teasers.heading-prefix')}
						<strong>{translator.t('teasers.heading-emphasis')}</strong>
					</>
				}
				articles={articles}
				journalCtaLabel={translator.t('teasers.goToJournal')}
				videoLabel={translator.t('badge.video')}
			/>
		</BlockWrapper>
	);
};

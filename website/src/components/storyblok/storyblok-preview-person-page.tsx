import { PersonProfile } from '@/components/storyblok/journal/person-profile';
import { StoryblokPreviewStory } from '@/components/storyblok/storyblok-preview-story';
import type { WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { getJournalPersonAction, getJournalPersonPageDataAction } from '@/modules/journal/journal.actions';
import type { JournalPerson } from '@/modules/journal/journal.types';
import type { ISbStoryData } from '@storyblok/js';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

type Props = {
	storyPath: string;
	slug: string;
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
	previewRoutePath: string;
	searchParams: Record<string, string | undefined>;
};

export const StoryblokPreviewPersonPage = async ({
	storyPath,
	slug,
	lang,
	currency,
	previewRoutePath,
	searchParams,
}: Props) => {
	const [t, tCommon] = await Promise.all([getTranslations('website-journal'), getTranslations('website-common')]);

	return await StoryblokPreviewStory<ISbStoryData<JournalPerson>>({
		storyPath,
		lang,
		previewRoutePath,
		searchParams,
		loadStory: async (_path, language) => {
			const storyResult = await getJournalPersonAction({
				slug,
				language,
			});

			return storyResult.success ? storyResult.data : null;
		},
		renderStory: async () => {
			const pageResult = await getJournalPersonPageDataAction({
				lang,
				currency,
				slug,
				journalLabel: t('overview.title'),
				homeLabel: tCommon('breadcrumb.home'),
			});

			if (!pageResult.success) {
				return notFound();
			}

			return (
				<PersonProfile
					{...pageResult.data}
					articlesHeading={t('person.articles')}
					lang={lang}
					currency={currency}
					moreArticlesLabel={t('overview.more-articles')}
					videoLabel={t('badge.video')}
				/>
			);
		},
	});
};

import { PersonProfile } from '@/components/storyblok/journal/person-profile';
import { StoryblokPreviewStory } from '@/components/storyblok/storyblok-preview-story';
import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { getJournalPersonAction, getJournalPersonPageDataAction } from '@/modules/journal/journal.actions';
import type { JournalPerson } from '@/modules/journal/journal.types';
import type { ISbStoryData } from '@storyblok/js';
import { notFound } from 'next/navigation';

type Props = {
	storyPath: string;
	slug: string;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
	previewRoutePath: string;
	searchParams: Record<string, string | undefined>;
};

export const StoryblokPreviewPersonPage = async ({
	storyPath,
	slug,
	lang,
	region,
	previewRoutePath,
	searchParams,
}: Props) => {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-journal', 'common', 'website-common'],
	});

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
				region,
				slug,
				journalLabel: translator.t('overview.title'),
				homeLabel: translator.t('breadcrumb.home', { namespace: 'website-common' }),
			});

			if (!pageResult.success) {
				return notFound();
			}

			return (
				<PersonProfile
					{...pageResult.data}
					articlesHeading={translator.t('person.articles')}
					lang={lang}
					region={region}
					moreArticlesLabel={translator.t('overview.more-articles')}
					videoLabel={translator.t('badge.video')}
				/>
			);
		},
	});
};

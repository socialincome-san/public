import { buildVolunteerDurationConfig, PersonProfile } from '@/components/storyblok/journal/person-profile';
import { StoryblokPreviewStory } from '@/components/storyblok/storyblok-preview-story';
import type { Person } from '@/generated/storyblok/types/109655/storyblok-components';
import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
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

	return await StoryblokPreviewStory<ISbStoryData<Person>>({
		storyPath,
		lang,
		previewRoutePath,
		searchParams,
		loadStory: async (path, language) => {
			const storyResult = await services.storyblok.getStoryWithFallback<ISbStoryData<Person>>(path, language);

			return storyResult.success ? storyResult.data : null;
		},
		renderStory: async () => {
			const pageResult = await services.journal.getPersonPageData(
				lang,
				region,
				slug,
				translator.t('person.breadcrumb'),
				translator.t('breadcrumb.home', { namespace: 'website-common' }),
			);

			if (!pageResult.success) {
				return notFound();
			}

			return (
				<PersonProfile
					{...pageResult.data}
					articlesHeading={translator.t('person.articles')}
					profileTranslations={{
						circles: translator.t('person.circles'),
						activeCircle: translator.t('person.circle-active'),
						interestedCircle: translator.t('person.circle-interested'),
						commitment: translator.t('person.commitment'),
						workStyle: translator.t('person.work-style'),
						likesDeadline: translator.t('person.likes-deadline'),
						likesDeadlineYes: translator.t('person.likes-deadline-yes'),
						likesDeadlineNo: translator.t('person.likes-deadline-no'),
						timeCommitment: translator.t('person.time-commitment'),
						timeCommitmentUnit: translator.t('person.time-commitment-unit'),
					}}
					volunteerDuration={buildVolunteerDurationConfig(translator, lang)}
					lang={lang}
					region={region}
					moreArticlesLabel={translator.t('overview.more-articles')}
					videoLabel={translator.t('badge.video')}
				/>
			);
		},
	});
};

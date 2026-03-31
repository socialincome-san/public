import { LandingPageDetail } from '@/components/storyblok/shared/landing-page-detail';
import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage } from '@/lib/i18n/utils';
import type { FocusStory } from './focus.types';
import { getFocusDescription, getFocusTitle } from './focus.utils';

type Props = {
	focus: FocusStory;
	lang: WebsiteLanguage;
	activeProgramsCount: number;
	recipientsInProgramsCount: number;
	candidatesCount: number;
};

export const FocusDetail = async ({
	focus,
	lang,
	activeProgramsCount,
	recipientsInProgramsCount,
	candidatesCount,
}: Props) => {
	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-common'] });
	const focusTitle = getFocusTitle(focus.content);
	const focusDescription = getFocusDescription(focus.content);
	const heroImageFilename = focus.content.heroImage?.filename;
	const heroImageAlt = focus.content.heroImage?.alt ?? focusTitle;

	return (
		<LandingPageDetail
			title={focusTitle}
			description={focusDescription}
			heroImageFilename={heroImageFilename}
			heroImageAlt={heroImageAlt}
			stats={[
				{
					value: activeProgramsCount,
					label:
						activeProgramsCount === 1
							? translator.t('focuses-page.active-program-singular')
							: translator.t('focuses-page.active-program-plural'),
				},
				{
					value: recipientsInProgramsCount,
					label:
						recipientsInProgramsCount === 1
							? translator.t('focuses-page.recipient-in-program-singular')
							: translator.t('focuses-page.recipient-in-program-plural'),
				},
				{
					value: candidatesCount,
					label:
						candidatesCount === 1
							? translator.t('focuses-page.candidate-singular')
							: translator.t('focuses-page.candidate-plural'),
				},
			]}
			descriptionHeading={`${translator.t('focuses-page.about')} ${focusTitle}`}
		/>
	);
};

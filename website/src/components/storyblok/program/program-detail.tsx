import { LandingPageDetail } from '@/components/storyblok/shared/landing-page-detail';
import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage } from '@/lib/i18n/utils';
import type { ProgramStory } from './program.types';
import { getProgramDescription, getProgramTitle } from './program.utils';

type Props = {
	program: ProgramStory;
	lang: WebsiteLanguage;
	campaignsCount?: number;
	recipientsCount?: number;
};

export const ProgramDetail = async ({ program, lang, campaignsCount, recipientsCount }: Props) => {
	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-common'] });
	const programTitle = getProgramTitle(program.content);
	const programDescription = getProgramDescription(program.content);
	const heroImageFilename = program.content.heroImage?.filename;
	const heroImageAlt = program.content.heroImage?.alt ?? programTitle;

	return (
		<LandingPageDetail
			title={programTitle}
			description={programDescription}
			heroImageFilename={heroImageFilename}
			heroImageAlt={heroImageAlt}
			stats={
				campaignsCount !== undefined && recipientsCount !== undefined
					? [
							{
								value: campaignsCount,
								label:
									campaignsCount === 1
										? translator.t('programs-page.campaign-singular')
										: translator.t('programs-page.campaign-plural'),
							},
							{
								value: recipientsCount,
								label:
									recipientsCount === 1
										? translator.t('programs-page.recipient-singular')
										: translator.t('programs-page.recipient-plural'),
							},
						]
					: []
			}
			descriptionHeading={`${translator.t('programs-page.about')} ${programTitle}`}
		/>
	);
};

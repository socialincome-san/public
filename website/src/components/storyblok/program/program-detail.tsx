import { LandingPageDetail } from '@/components/storyblok/shared/landing-page-detail';
import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage } from '@/lib/i18n/utils';

type Props = {
	title: string;
	description: string;
	lang: WebsiteLanguage;
	heroImageFilename?: string;
	heroImageAlt: string;
	campaignsCount?: number;
	recipientsCount?: number;
};

export const ProgramDetail = async ({
	title,
	description,
	lang,
	heroImageFilename,
	heroImageAlt,
	campaignsCount,
	recipientsCount,
}: Props) => {
	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-common'] });

	return (
		<LandingPageDetail
			title={title}
			description={description}
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
			descriptionHeading={`${translator.t('programs-page.about')} ${title}`}
		/>
	);
};

import { LandingPageDetail } from '@/components/storyblok/shared/landing-page-detail';
import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import type { LocalPartnerStory } from './local-partner.types';
import { getLocalPartnerDescription, getLocalPartnerTitle } from './local-partner.utils';

type Props = {
	localPartner: LocalPartnerStory;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
	assignedRecipientsCount?: number;
	waitingRecipientsCount?: number;
};

export const LocalPartnerDetail = async ({
	localPartner,
	lang,
	region: _region,
	assignedRecipientsCount,
	waitingRecipientsCount,
}: Props) => {
	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-common'] });
	const localPartnerTitle = getLocalPartnerTitle(localPartner.content);
	const localPartnerDescription = getLocalPartnerDescription(localPartner.content);
	const heroImageFilename = localPartner.content.heroImage?.filename;
	const heroImageAlt = localPartner.content.heroImage?.alt ?? localPartnerTitle;

	return (
		<LandingPageDetail
			title={localPartnerTitle}
			description={localPartnerDescription}
			heroImageFilename={heroImageFilename}
			heroImageAlt={heroImageAlt}
			stats={
				assignedRecipientsCount !== undefined && waitingRecipientsCount !== undefined
					? [
							{
								value: assignedRecipientsCount,
								label:
									assignedRecipientsCount === 1
										? translator.t('local-partners-page.recipient-in-program-singular')
										: translator.t('local-partners-page.recipient-in-program-plural'),
							},
							{
								value: waitingRecipientsCount,
								label:
									waitingRecipientsCount === 1
										? translator.t('local-partners-page.recipient-waiting-singular')
										: translator.t('local-partners-page.recipient-waiting-plural'),
							},
						]
					: []
			}
			descriptionHeading={`${translator.t('local-partners-page.about')} ${localPartnerTitle}`}
		/>
	);
};

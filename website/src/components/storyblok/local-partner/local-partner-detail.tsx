import { LandingPageDetail } from '@/components/storyblok/shared/landing-page-detail';
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

const formatLabel = (value: number, singular: string, plural: string) => {
	return value === 1 ? singular : plural;
};

export const LocalPartnerDetail = ({
	localPartner,
	lang: _lang,
	region: _region,
	assignedRecipientsCount,
	waitingRecipientsCount,
}: Props) => {
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
								label: formatLabel(assignedRecipientsCount, 'recipient in a program', 'recipients in a program'),
							},
							{
								value: waitingRecipientsCount,
								label: formatLabel(waitingRecipientsCount, 'recipient waiting', 'recipients waiting'),
							},
						]
					: []
			}
			descriptionHeading={`About ${localPartnerTitle}`}
		/>
	);
};


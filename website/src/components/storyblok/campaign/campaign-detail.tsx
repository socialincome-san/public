import { LandingPageDetail } from '@/components/storyblok/shared/landing-page-detail';
import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage } from '@/lib/i18n/utils';
import type { CampaignStory } from './campaign.types';
import { getCampaignDescription, getCampaignTitle } from './campaign.utils';

type Props = {
	campaign: CampaignStory;
	lang: WebsiteLanguage;
	contributionsCount?: number;
	daysLeft?: number;
};

export const CampaignDetail = async ({ campaign, lang, contributionsCount, daysLeft }: Props) => {
	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-common'] });
	const campaignTitle = getCampaignTitle(campaign.content);
	const campaignDescription = getCampaignDescription(campaign.content);
	const heroImageFilename = campaign.content.heroImage?.filename;
	const heroImageAlt = campaign.content.heroImage?.alt ?? campaignTitle;

	return (
		<LandingPageDetail
			title={campaignTitle}
			description={campaignDescription}
			heroImageFilename={heroImageFilename}
			heroImageAlt={heroImageAlt}
			stats={
				contributionsCount !== undefined && daysLeft !== undefined
					? [
							{
								value: contributionsCount,
								label:
									contributionsCount === 1
										? translator.t('campaigns-page.contribution-singular')
										: translator.t('campaigns-page.contribution-plural'),
							},
							{
								value: daysLeft,
								label:
									daysLeft === 1
										? translator.t('campaigns-page.day-left-singular')
										: translator.t('campaigns-page.day-left-plural'),
							},
						]
					: []
			}
			descriptionHeading={`${translator.t('campaigns-page.about')} ${campaignTitle}`}
		/>
	);
};

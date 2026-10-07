import { buildCampaignFundraisingPillLabels } from '@/components/campaign/build-campaign-fundraising-pill-labels';
import { CampaignDonationFormServer } from '@/components/campaign/campaign-donation/campaign-donation-form-server';
import { CampaignFundraisingPills } from '@/components/campaign/campaign-fundraising-pills';
import { getCampaignDaysRemaining } from '@/components/campaign/get-campaign-days-remaining';
import type { HeroHeaderImage } from '@/components/storyblok/shared/hero-header';
import type { Translator } from '@/lib/i18n/translator';
import { getSafeNumberFormatLocale, type WebsiteLanguage } from '@/lib/i18n/utils';
import { formatStoryblokUrl } from '@/lib/storyblok/storyblok-utils';
import { formatNumberLocale } from '@/lib/utils/string-utils';
import type { CampaignPage } from '@/modules/campaigns/campaign.types';
import {
	MediaHero,
	MediaHeroIntro,
	MediaHeroStat,
	MediaHeroStats,
} from '@socialincome/design-system/layout/media-hero/media-hero';

const HERO_HEADER_IMAGE_WIDTH = 1920;
const HERO_HEADER_IMAGE_HEIGHT = 1080;

type Props = {
	campaign: CampaignPage;
	title: string;
	creatorName: string;
	quote: string;
	primaryImage?: HeroHeaderImage | null;
	profilePicture?: HeroHeaderImage | null;
	translator: Translator;
	lang: WebsiteLanguage;
};

export const CampaignHero = ({
	campaign,
	title,
	creatorName,
	quote,
	primaryImage,
	profilePicture,
	translator,
	lang,
}: Props) => {
	const hasGoal = campaign.goal !== null && campaign.goal !== undefined;
	const raisedPercent = campaign.percentageCollected ?? 0;
	const isActive = campaign.isActive;
	const heroImageSrc = primaryImage?.filename
		? formatStoryblokUrl(primaryImage.filename, HERO_HEADER_IMAGE_WIDTH, HERO_HEADER_IMAGE_HEIGHT, primaryImage.focus)
		: null;
	const heroImageAlt = primaryImage?.alt ?? title;
	const locale = getSafeNumberFormatLocale(lang);
	const { remainingDays, progress: daysProgress } = getCampaignDaysRemaining({
		endDate: campaign.endDate,
		createdAt: campaign.createdAt,
	});
	const donationFormProps = {
		lang,
		campaignId: campaign.id,
		quote,
		creatorName,
		profilePicture,
	};
	const fundraisingPillLabels = isActive
		? buildCampaignFundraisingPillLabels(campaign, remainingDays, translator, locale)
		: [];

	return (
		<MediaHero
			image={heroImageSrc ? { src: heroImageSrc, alt: heroImageAlt } : null}
			overlay="strong"
			top={fundraisingPillLabels.length > 0 ? <CampaignFundraisingPills labels={fundraisingPillLabels} /> : null}
			aside={isActive ? <CampaignDonationFormServer {...donationFormProps} /> : null}
			mobileAside={isActive ? <CampaignDonationFormServer {...donationFormProps} /> : null}
		>
			<MediaHeroIntro title={title} kicker={translator.t('campaign.by', { context: { creator: creatorName } })} shadow />
			<MediaHeroStats>
				<MediaHeroStat
					label={translator.t('campaigns-page.raised-percentage', {
						namespace: 'website-common',
						context: {
							percentage: raisedPercent,
							currency: campaign.currency,
						},
					})}
					value={formatNumberLocale(campaign.amountCollected ?? 0, locale)}
					target={hasGoal ? formatNumberLocale(campaign.goal ?? 0, locale) : undefined}
					progress={raisedPercent}
				/>
				<MediaHeroStat
					label={translator.t('campaign.days-left')}
					value={formatNumberLocale(remainingDays, locale)}
					progress={daysProgress}
				/>
			</MediaHeroStats>
		</MediaHero>
	);
};

import { CampaignDonationForm } from '@/components/campaign/campaign-donation/campaign-donation-form';
import type { HeroHeaderImage } from '@/components/storyblok/shared/hero-header';
import { getWebsiteCurrencyFromCookie } from '@/lib/i18n/get-website-currency';
import { formatStoryblokUrl } from '@/lib/storyblok/storyblok-utils';

const PROFILE_PICTURE_SIZE = 87;

type Props = {
	campaignId?: string;
	quote: string;
	creatorName: string;
	profilePicture?: HeroHeaderImage | null;
};

export const CampaignDonationFormServer = async ({ campaignId, quote, creatorName, profilePicture }: Props) => {
	const currency = await getWebsiteCurrencyFromCookie();
	const profilePictureSrc = profilePicture?.filename
		? formatStoryblokUrl(profilePicture.filename, PROFILE_PICTURE_SIZE, PROFILE_PICTURE_SIZE, profilePicture.focus)
		: null;
	const profilePictureAlt = profilePicture?.alt?.trim() ?? creatorName;

	return (
		<CampaignDonationForm
			campaignId={campaignId}
			currency={currency}
			quote={quote}
			profilePictureSrc={profilePictureSrc}
			profilePictureAlt={profilePictureAlt}
		/>
	);
};

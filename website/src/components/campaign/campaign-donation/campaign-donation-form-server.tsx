import { CampaignDonationForm } from '@/components/campaign/campaign-donation/campaign-donation-form';
import { getDonationAmountFieldsTranslations } from '@/components/donation-wizard/i18n/donation-amount-fields-translations';
import type { HeroHeaderImage } from '@/components/storyblok/shared/hero-header';
import { getWebsiteCurrencyFromCookie } from '@/lib/i18n/get-website-currency';
import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage } from '@/lib/i18n/utils';
import { formatStoryblokUrl } from '@/lib/services/storyblok/storyblok.utils';

const PROFILE_PICTURE_SIZE = 87;

type Props = {
	lang: WebsiteLanguage;
	campaignId?: string;
	quote: string;
	creatorName: string;
	profilePicture?: HeroHeaderImage | null;
};

export const CampaignDonationFormServer = async ({ lang, campaignId, quote, creatorName, profilePicture }: Props) => {
	const translator = await Translator.getInstance({ language: lang, namespaces: 'donation-wizard' });
	const currency = await getWebsiteCurrencyFromCookie();
	const profilePictureSrc = profilePicture?.filename
		? formatStoryblokUrl(profilePicture.filename, PROFILE_PICTURE_SIZE, PROFILE_PICTURE_SIZE, profilePicture.focus)
		: null;
	const trimmedProfilePictureAlt = profilePicture?.alt?.trim();
	const profilePictureAlt = trimmedProfilePictureAlt ? trimmedProfilePictureAlt : creatorName;

	return (
		<CampaignDonationForm
			campaignId={campaignId}
			translations={getDonationAmountFieldsTranslations(translator.t)}
			currency={currency}
			quote={quote}
			profilePictureSrc={profilePictureSrc}
			profilePictureAlt={profilePictureAlt}
			zewoLabel={translator.t('impact.zewo')}
		/>
	);
};

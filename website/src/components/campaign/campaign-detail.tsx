import { CampaignAboutSection } from '@/components/campaign/campaign-about-section';
import { CampaignExtraText } from '@/components/campaign/campaign-extra-text';
import { CampaignFaqSection } from '@/components/campaign/campaign-faq-section';
import { CampaignHero } from '@/components/campaign/campaign-hero';
import { CampaignJournalTeaser } from '@/components/campaign/campaign-journal-teaser';
import { CampaignNewsletter } from '@/components/campaign/campaign-newsletter';
import { CampaignOtherCampaignsTeaser } from '@/components/campaign/campaign-other-campaigns-teaser';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { getCampaignPageContentAction } from '@/lib/server-actions/campaigns-actions';
import type { CampaignPage } from '@/lib/services/campaign/campaign.types';

type Props = {
	campaign: CampaignPage;
	campaignSlug: string;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
};

export const CampaignDetail = async ({ campaign, campaignSlug, lang, region }: Props) => {
	const pageContentResult = await getCampaignPageContentAction(lang);
	if (!pageContentResult.success) {
		throw new Error(pageContentResult.error);
	}
	const { translator, faqs } = pageContentResult.data;
	const newsletterTranslations = {
		title: translator.t('popup.information-label'),
		emailPlaceholder: translator.t('popup.email-placeholder'),
		buttonAddSubscriber: translator.t('popup.button-subscribe'),
		toastSuccess: translator.t('popup.toast-success'),
		toastFailure: translator.t('popup.toast-failure'),
	};

	return (
		<>
			<CampaignHero campaign={campaign} lang={lang} region={region} translator={translator} />
			{campaign.secondDescription && campaign.thirdDescription && <CampaignExtraText campaign={campaign} />}
			<CampaignNewsletter lang={lang} translations={newsletterTranslations} />
			<CampaignAboutSection translator={translator} />
			<CampaignOtherCampaignsTeaser currentCampaignSlug={campaignSlug} lang={lang} region={region} />
			<CampaignJournalTeaser lang={lang} region={region} />
			{faqs.length > 0 && (
				<CampaignFaqSection heading={translator.t('campaign.title')} faqs={faqs} lang={lang} region={region} />
			)}
		</>
	);
};

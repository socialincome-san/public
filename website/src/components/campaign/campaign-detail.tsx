import { BlockWrapper } from '@/components/block-wrapper';
import { Breadcrumb } from '@/components/breadcrumb/breadcrumb';
import { buildBreadcrumbLinks } from '@/components/breadcrumb/build-breadcrumb-links';
import { CampaignAboutSection } from '@/components/campaign/campaign-about-section';
import { CampaignFaqSection } from '@/components/campaign/campaign-faq-section';
import { CampaignHero } from '@/components/campaign/campaign-hero';
import { CampaignJournalTeaser } from '@/components/campaign/campaign-journal-teaser';
import { CampaignNewsletter } from '@/components/campaign/campaign-newsletter';
import { CampaignOtherCampaignsTeaser } from '@/components/campaign/campaign-other-campaigns-teaser';
import { CampaignProgramTeaser } from '@/components/campaign/campaign-program-teaser';
import type { HeroHeaderImage } from '@/components/storyblok/shared/hero-header';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import type { CampaignPage } from '@/lib/services/campaign/campaign.types';
import { services } from '@/lib/services/services';
import { getCampaignStoryPath } from '@/lib/storyblok/storyblok-paths';

type Props = {
	campaign: CampaignPage;
	title: string;
	description: string;
	creatorName: string;
	quote: string;
	primaryImage?: HeroHeaderImage | null;
	profilePicture?: HeroHeaderImage | null;
	campaignSlug: string;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
};

export const CampaignDetail = async ({
	campaign,
	title,
	description,
	creatorName,
	quote,
	primaryImage,
	profilePicture,
	campaignSlug,
	lang,
	region,
}: Props) => {
	const [pageContentResult, breadcrumbLinks] = await Promise.all([
		services.read.campaignPublicWebsite.getPageContent(lang),
		buildBreadcrumbLinks({
			fullSlug: getCampaignStoryPath(campaignSlug),
			currentLabel: title,
			lang,
			region,
		}),
	]);
	if (!pageContentResult.success) {
		throw new Error(pageContentResult.error);
	}
	const { translator, faqs } = pageContentResult.data;
	const newsletterTranslations = {
		title: translator.t('popup.information-label'),
		emailLabel: translator.t('updates.email'),
		emailPlaceholder: translator.t('popup.email-placeholder'),
		buttonAddSubscriber: translator.t('popup.button-subscribe'),
		toastSuccess: translator.t('popup.toast-success'),
		toastFailure: translator.t('popup.toast-failure'),
	};

	return (
		<>
			<CampaignHero
				campaign={campaign}
				title={title}
				creatorName={creatorName}
				quote={quote}
				primaryImage={primaryImage}
				profilePicture={profilePicture}
				translator={translator}
				lang={lang}
			/>
			<Breadcrumb links={breadcrumbLinks} className="py-0" />
			<BlockWrapper className="my-15" disableMarginTop={true} disableMarginBottom={true}>
				<div>{description}</div>
			</BlockWrapper>
			{campaign.program?.id ? <CampaignProgramTeaser programId={campaign.program.id} lang={lang} region={region} /> : null}
			<CampaignNewsletter lang={lang} translations={newsletterTranslations} />
			<CampaignAboutSection translator={translator} />
			<CampaignOtherCampaignsTeaser currentCampaignSlug={campaignSlug} lang={lang} region={region} />
			<CampaignJournalTeaser lang={lang} region={region} />
			{faqs.length > 0 && <CampaignFaqSection heading={translator.t('campaign.title')} faqs={faqs} />}
		</>
	);
};

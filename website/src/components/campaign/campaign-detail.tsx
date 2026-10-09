import { Breadcrumb } from '@/components/breadcrumb/breadcrumb';
import { buildBreadcrumbLinks } from '@/components/breadcrumb/build-breadcrumb-links';
import { buildCampaignSubmissionLabels } from '@/components/campaign/build-campaign-submission-labels';
import { CampaignAboutSection } from '@/components/campaign/campaign-about-section';
import { CampaignCreationTeaser } from '@/components/campaign/campaign-creation-teaser';
import { CampaignFaqSection } from '@/components/campaign/campaign-faq-section';
import { CampaignHero } from '@/components/campaign/campaign-hero';
import { CampaignJournalTeaser } from '@/components/campaign/campaign-journal-teaser';
import { CampaignNewsletter } from '@/components/campaign/campaign-newsletter';
import { CampaignOtherCampaignsTeaser } from '@/components/campaign/campaign-other-campaigns-teaser';
import { CampaignProgramTeaser } from '@/components/campaign/campaign-program-teaser';
import { CampaignVideoSlider } from '@/components/campaign/campaign-video-slider';
import { Community } from '@/components/community/community';
import type { HeroHeaderImage } from '@/components/storyblok/shared/hero-header';
import type { Campaign } from '@/generated/storyblok/types/109655/storyblok-components';
import type { WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { getCampaignStoryPath } from '@/lib/storyblok/storyblok-paths';
import { getCampaignPageContentAction } from '@/modules/campaigns/campaign.actions';
import type { CampaignPage } from '@/modules/campaigns/campaign.types';
import type { CommunityPanelData } from '@/modules/community/community.types';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import { getTranslations } from 'next-intl/server';

type Props = {
	campaign: CampaignPage;
	title: string;
	description: string;
	creatorName: string;
	quote: string;
	primaryImage?: HeroHeaderImage | null;
	profilePicture?: HeroHeaderImage | null;
	sectionDescription?: string | null;
	sectionImage?: HeroHeaderImage | null;
	instagramHandle?: string | null;
	xHandle?: string | null;
	tiktokHandle?: string | null;
	linkWebsite?: string | null;
	campaignSlug: string;
	faq?: Campaign['faq'];
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
	community: CommunityPanelData | null;
};

export const CampaignDetail = async ({
	campaign,
	title,
	description,
	creatorName,
	quote,
	primaryImage,
	profilePicture,
	sectionDescription,
	sectionImage,
	instagramHandle,
	xHandle,
	tiktokHandle,
	linkWebsite,
	campaignSlug,
	faq,
	lang,
	currency,
	community,
}: Props) => {
	const [pageContentResult, breadcrumbLinks, t, tCommon, tNewsletter, tFaq] = await Promise.all([
		getCampaignPageContentAction(lang, faq),
		buildBreadcrumbLinks({
			fullSlug: getCampaignStoryPath(campaignSlug),
			currentLabel: title,
			lang,
			currency,
		}),
		getTranslations('website-campaign'),
		getTranslations('website-common'),
		getTranslations('website-newsletter'),
		getTranslations('website-faq'),
	]);
	if (!pageContentResult.success) {
		throw new Error(pageContentResult.error);
	}
	const { faqs, videoPlaybackIds, newsletter } = pageContentResult.data;
	const trimmedDescription = description.trim();
	const submissionLabels = buildCampaignSubmissionLabels(tCommon);
	const newsletterTranslations = {
		firstNameLabel: tNewsletter('popup.first-name'),
		emailLabel: tNewsletter('popup.email'),
		emailPlaceholder: tNewsletter('popup.email-placeholder'),
		buttonAddSubscriber: tNewsletter('popup.button-subscribe'),
		sentBy: tNewsletter('popup.sent-by'),
		toastSuccess: tNewsletter('popup.toast-success'),
		toastFailure: tNewsletter('popup.toast-failure'),
	};
	const videoSliderTranslations = {
		title: t('campaign.video-slider.title'),
		description: t('campaign.video-slider.description'),
		videoTitles: videoPlaybackIds.map((_, index) => t('campaign.video-slider.video-title', { index: index + 1 })),
		showVideoLabels: videoPlaybackIds.map((_, index) => t('campaign.video-slider.show-video', { index: index + 1 })),
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
				lang={lang}
			/>
			<div className="pt-9">
				<Breadcrumb links={breadcrumbLinks} layout="section" aside={community ? <Community data={community} /> : null} />
			</div>
			{trimmedDescription ? (
				<BlockWrapper spacing="compact">
					<p className="text-foreground max-w-2xl text-lg whitespace-pre-wrap">{trimmedDescription}</p>
				</BlockWrapper>
			) : null}
			<CampaignAboutSection
				heading={t('campaign.about-title')}
				sectionDescription={sectionDescription}
				sectionImage={sectionImage}
				instagramHandle={instagramHandle}
				xHandle={xHandle}
				tiktokHandle={tiktokHandle}
				linkWebsite={linkWebsite}
			/>
			{campaign.program?.id ? (
				<CampaignProgramTeaser programId={campaign.program.id} lang={lang} currency={currency} />
			) : null}
			<CampaignCreationTeaser
				translations={{
					title: t('campaign.creation-teaser.title'),
					description: t('campaign.creation-teaser.description'),
					button: t('campaign.creation-teaser.button'),
				}}
				labels={submissionLabels}
				lang={lang}
				currency={currency}
			/>
			<CampaignNewsletter
				lang={lang}
				title={newsletter.title}
				senderName={newsletter.senderName}
				imageSrc={newsletter.imageSrc}
				imageAlt={newsletter.imageAlt}
				translations={newsletterTranslations}
			/>
			<CampaignVideoSlider translations={videoSliderTranslations} videoPlaybackIds={videoPlaybackIds} />
			<CampaignOtherCampaignsTeaser currentCampaignSlug={campaignSlug} lang={lang} currency={currency} />
			<CampaignJournalTeaser lang={lang} currency={currency} />
			{faqs.length > 0 && <CampaignFaqSection heading={tFaq('title')} faqs={faqs} />}
		</>
	);
};

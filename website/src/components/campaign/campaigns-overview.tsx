import { CampaignPreviewWallet } from '@/components/campaign/campaign-preview-wallet';
import { CampaignsOverviewFilters } from '@/components/campaign/campaigns-overview-filters';
import { CreateCampaignButton } from '@/components/campaign/create-campaign-button';
import { CmsHeader } from '@/components/storyblok/shared/cms-header';
import { campaignSubmissionConfig } from '@/lib/config/campaign-submission.config';
import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { isCampaignActive, matchesPublicCampaignActivity } from '@/lib/services/campaign/campaign-public-activity';
import {
	campaignSubmissionErrorCodes,
	type CampaignSubmissionErrorCode,
} from '@/lib/services/campaign/campaign-submission-input';
import type { PublicCampaignCard, PublicCampaignStatsMap } from '@/lib/services/campaign/campaign.types';
import type { CampaignStateFilter } from './campaigns-overview-query';

type Props = {
	campaigns: PublicCampaignCard[];
	statsById: PublicCampaignStatsMap;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
	title?: string;
	text?: string;
	showStateFilter?: boolean;
	selectedState?: CampaignStateFilter;
};

export const CampaignsOverview = async ({
	campaigns,
	statsById,
	lang,
	region,
	title,
	text,
	showStateFilter = false,
	selectedState = 'active',
}: Props) => {
	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-common'] });
	const hasCmsHeader = Boolean(title?.trim()) || Boolean(text?.trim());
	const filteredCampaigns = campaigns
		.map((campaign) => {
			const isActive = isCampaignActive({
				endDate: campaign.endDate,
				goal: campaign.goal,
				amountCollected: statsById[campaign.id]?.amountCollected ?? null,
			});

			return { ...campaign, isActive };
		})
		.filter((campaign) => matchesPublicCampaignActivity(campaign.isActive, selectedState));
	const errorContext = {
		minDays: campaignSubmissionConfig.minCampaignDurationDays,
		maxDays: campaignSubmissionConfig.maxCampaignDurationDays,
		maxImageMb: campaignSubmissionConfig.maxImageBytes / (1024 * 1024),
	};
	const submissionErrors = Object.fromEntries(
		campaignSubmissionErrorCodes.map((code) => [
			code,
			translator.t(`campaigns-page.submission.errors.${code}`, { context: errorContext }),
		]),
	) as Record<CampaignSubmissionErrorCode, string>;
	const submissionLabels = {
		programStepTitle: translator.t('campaigns-page.submission.program-step-title'),
		detailsStepTitle: translator.t('campaigns-page.submission.details-step-title'),
		aboutStepTitle: translator.t('campaigns-page.submission.about-step-title'),
		aboutStepSubtitle: translator.t('campaigns-page.submission.about-step-subtitle'),
		aboutStepDescription: translator.t('campaigns-page.submission.about-step-description'),
		personalStepTitle: translator.t('campaigns-page.submission.personal-step-title'),
		personalStepSubtitle: translator.t('campaigns-page.submission.personal-step-subtitle'),
		firstName: translator.t('campaigns-page.submission.first-name'),
		lastName: translator.t('campaigns-page.submission.last-name'),
		email: translator.t('campaigns-page.submission.email'),
		title: translator.t('campaigns-page.submission.title'),
		description: translator.t('campaigns-page.submission.description'),
		goal: translator.t('campaigns-page.submission.goal'),
		setGoalAmount: translator.t('campaigns-page.submission.set-goal-amount'),
		currency: translator.t('campaigns-page.submission.currency'),
		endDate: translator.t('campaigns-page.submission.end-date'),
		duration: translator.t('campaigns-page.submission.duration'),
		duration30: translator.t('campaigns-page.submission.duration-30'),
		duration90: translator.t('campaigns-page.submission.duration-90'),
		duration365: translator.t('campaigns-page.submission.duration-365'),
		durationOther: translator.t('campaigns-page.submission.duration-other'),
		access: translator.t('campaigns-page.submission.access'),
		accessPublic: translator.t('campaigns-page.submission.access-public'),
		accessPublicDescription: translator.t('campaigns-page.submission.access-public-description'),
		accessPrivate: translator.t('campaigns-page.submission.access-private'),
		accessPrivateDescription: translator.t('campaigns-page.submission.access-private-description'),
		accessRecommended: translator.t('campaigns-page.submission.access-recommended'),
		program: translator.t('campaigns-page.submission.program'),
		campaignBackground: translator.t('campaigns-page.submission.campaign-background'),
		uploadImage: translator.t('campaigns-page.submission.upload-image'),
		removeUploadedImage: translator.t('campaigns-page.submission.remove-uploaded-image'),
		profilePicture: translator.t('campaigns-page.submission.profile-picture'),
		profilePictureHint: translator.t('campaigns-page.submission.profile-picture-hint'),
		editProfilePicture: translator.t('campaigns-page.submission.edit-profile-picture'),
		creatorNamePlaceholder: translator.t('campaigns-page.submission.creator-name-placeholder'),
		quote: translator.t('campaigns-page.submission.quote'),
		quotePlaceholder: translator.t('campaigns-page.submission.quote-placeholder'),
		quoteHint: translator.t('campaigns-page.submission.quote-hint'),
		hasAdditionalInformation: translator.t('campaigns-page.submission.has-additional-information'),
		sectionDescription: translator.t('campaigns-page.submission.section-description'),
		sectionImage: translator.t('campaigns-page.submission.section-image'),
		instagramHandle: translator.t('campaigns-page.submission.instagram-handle'),
		xHandle: translator.t('campaigns-page.submission.x-handle'),
		linkWebsite: translator.t('campaigns-page.submission.link-website'),
		tiktokHandle: translator.t('campaigns-page.submission.tiktok-handle'),
		instagramHandlePlaceholder: translator.t('campaigns-page.submission.instagram-handle-placeholder'),
		xHandlePlaceholder: translator.t('campaigns-page.submission.x-handle-placeholder'),
		tiktokHandlePlaceholder: translator.t('campaigns-page.submission.tiktok-handle-placeholder'),
		submit: translator.t('campaigns-page.submission.submit'),
		submitting: translator.t('campaigns-page.submission.submitting'),
		successTitle: translator.t('campaigns-page.submission.success-title'),
		success: translator.t('campaigns-page.submission.success'),
		error: translator.t('campaigns-page.submission.error'),
		currencyPlaceholder: translator.t('campaigns-page.submission.currency-placeholder'),
		imageHint: translator.t('campaigns-page.submission.image-hint'),
		continue: translator.t('campaigns-page.submission.continue'),
		back: translator.t('campaigns-page.submission.back'),
		allCountries: translator.t('campaigns-page.submission.all-countries'),
		filterByCountry: translator.t('campaigns-page.submission.filter-by-country'),
		formSteps: translator.t('campaigns-page.submission.form-steps'),
		stepLabel: translator.t('campaigns-page.submission.step-label'),
		recipientsCount: translator.t('campaigns-page.submission.recipients-count'),
		details: translator.t('campaigns-page.submission.details'),
		about: translator.t('campaigns-page.submission.about'),
		personal: translator.t('campaigns-page.submission.personal'),
		programsLoading: translator.t('campaigns-page.submission.programs-loading'),
		programsEmpty: translator.t('campaigns-page.submission.programs-empty'),
		defaultImagesLoading: translator.t('campaigns-page.submission.default-images-loading'),
		defaultImagesError: translator.t('campaigns-page.submission.default-images-error'),
		errors: submissionErrors,
	};

	return (
		<div className="flex w-full flex-col gap-8">
			{hasCmsHeader ? <CmsHeader title={title} text={text} /> : null}
			{showStateFilter ? (
				<div className="flex flex-wrap items-center justify-between gap-4">
					<CampaignsOverviewFilters
						allLabel={translator.t('campaigns-page.all-states')}
						activeLabel={translator.t('campaigns-page.state-active')}
						inactiveLabel={translator.t('campaigns-page.state-inactive')}
						selectedState={selectedState}
					/>
					<CreateCampaignButton
						label={translator.t('campaigns-page.create-campaign')}
						labels={submissionLabels}
						lang={lang}
						region={region}
					/>
				</div>
			) : null}
			{filteredCampaigns.length === 0 ? (
				<p className="text-muted-foreground">{translator.t('campaigns-page.empty')}</p>
			) : (
				<ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{filteredCampaigns.map((campaign) => (
						<li key={campaign.id} className="h-full">
							<CampaignPreviewWallet
								campaign={campaign}
								stats={statsById[campaign.id]}
								lang={lang}
								region={region}
								t={translator.t}
							/>
						</li>
					))}
				</ul>
			)}
		</div>
	);
};

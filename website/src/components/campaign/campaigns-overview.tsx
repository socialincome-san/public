import { CampaignPreviewWallet } from '@/components/campaign/campaign-preview-wallet';
import { CampaignsOverviewFilters } from '@/components/campaign/campaigns-overview-filters';
import { CreateCampaignButton } from '@/components/campaign/create-campaign-button';
import { CmsHeader } from '@/components/storyblok/shared/cms-header';
import { campaignSubmissionConfig } from '@/lib/config/campaign-submission.config';
import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { isCampaignPubliclyActive, matchesPublicCampaignActivity } from '@/lib/services/campaign/campaign-public-activity';
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
			const isActive = isCampaignPubliclyActive({
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
		title: translator.t('campaigns-page.submission.title'),
		description: translator.t('campaigns-page.submission.description'),
		goal: translator.t('campaigns-page.submission.goal'),
		currency: translator.t('campaigns-page.submission.currency'),
		endDate: translator.t('campaigns-page.submission.end-date'),
		program: translator.t('campaigns-page.submission.program'),
		primaryImage: translator.t('campaigns-page.submission.primary-image'),
		submit: translator.t('campaigns-page.submission.submit'),
		submitting: translator.t('campaigns-page.submission.submitting'),
		success: translator.t('campaigns-page.submission.success'),
		error: translator.t('campaigns-page.submission.error'),
		programPlaceholder: translator.t('campaigns-page.submission.program-placeholder'),
		currencyPlaceholder: translator.t('campaigns-page.submission.currency-placeholder'),
		imageHint: translator.t('campaigns-page.submission.image-hint'),
		continue: translator.t('campaigns-page.submission.continue'),
		back: translator.t('campaigns-page.submission.back'),
		allCountries: translator.t('campaigns-page.submission.all-countries'),
		recipientsCount: translator.t('campaigns-page.submission.recipients-count'),
		details: translator.t('campaigns-page.submission.details'),
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
						dialogTitle={translator.t('campaigns-page.submission.dialog-title')}
						labels={submissionLabels}
						lang={lang}
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

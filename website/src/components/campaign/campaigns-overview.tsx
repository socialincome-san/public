import { buildCampaignSubmissionLabels } from '@/components/campaign/build-campaign-submission-labels';
import { isCampaignActive, matchesPublicCampaignActivity } from '@/components/campaign/campaign-activity';
import { CampaignPreviewWallet } from '@/components/campaign/campaign-preview-wallet';
import { CampaignsOverviewFilters } from '@/components/campaign/campaigns-overview-filters';
import { CreateCampaignButton } from '@/components/campaign/create-campaign-button';
import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import type { PublicCampaignCard, PublicCampaignStatsMap } from '@/modules/campaigns/campaign.types';
import { CardGrid, CardGridItem } from '@socialincome/design-system/layout/card-grid/card-grid';
import { PageIntro } from '@socialincome/design-system/layout/page-intro/page-intro';
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
	const submissionLabels = buildCampaignSubmissionLabels(translator);

	return (
		<div className="flex w-full flex-col gap-8">
			<PageIntro title={title} description={text} />
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
			<CardGrid emptyMessage={translator.t('campaigns-page.empty')}>
				{filteredCampaigns.map((campaign) => (
					<CardGridItem key={campaign.id}>
						<CampaignPreviewWallet
							campaign={campaign}
							stats={statsById[campaign.id]}
							lang={lang}
							region={region}
							t={translator.t}
						/>
					</CardGridItem>
				))}
			</CardGrid>
		</div>
	);
};

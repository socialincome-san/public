import type { AnySearchParams } from '@/app/page-props';
import { buildCampaignSubmissionLabels } from '@/components/campaign/build-campaign-submission-labels';
import { isCampaignActive } from '@/components/campaign/campaign-activity';
import { CampaignPreviewWallet } from '@/components/campaign/campaign-preview-wallet';
import { campaignMatchesSearchQuery } from '@/components/campaign/campaigns-overview.server';
import { CreateCampaignButton } from '@/components/campaign/create-campaign-button';
import { getSearchQuery } from '@/components/filters/filter-query';
import { OverviewFilterBar } from '@/components/filters/overview-filter-bar';
import { type FilterStatus, getStatusQuery, StatusFilter } from '@/components/filters/status-filter';
import type { WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import type { PublicCampaignCard, PublicCampaignStatsMap } from '@/modules/campaigns/campaign.types';
import { CardGrid, CardGridItem } from '@socialincome/design-system/layout/card-grid/card-grid';
import { getTranslations } from 'next-intl/server';

type Props = {
	campaigns: PublicCampaignCard[];
	statsById: PublicCampaignStatsMap;
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
	/** The campaigns page, filtered by these params; without them it's a teaser grid of active campaigns */
	searchParams?: AnySearchParams;
	showFilters?: boolean;
};

export const CampaignsOverview = async ({ campaigns, statsById, lang, currency, searchParams, showFilters }: Props) => {
	const t = await getTranslations('website-common');
	const campaignsWithStatus = campaigns.map((campaign) => {
		const status: FilterStatus = isCampaignActive({
			endDate: campaign.endDate,
			goal: campaign.goal,
			amountCollected: statsById[campaign.id]?.amountCollected ?? null,
		})
			? 'active'
			: 'concluded';

		return { campaign, status };
	});
	const statuses = campaignsWithStatus.map(({ status }) => status);
	const statusQuery = getStatusQuery(searchParams);
	const selectedStatus = searchParams ? (statusQuery && statuses.includes(statusQuery) ? statusQuery : undefined) : 'active';
	const searchQuery = getSearchQuery(searchParams);
	const filteredCampaigns = campaignsWithStatus
		.filter(({ status }) => !selectedStatus || status === selectedStatus)
		.map(({ campaign }) => campaign)
		.filter((campaign) => !searchQuery || campaignMatchesSearchQuery(campaign, searchQuery));
	const grid = (
		<CardGrid emptyMessage={t('campaigns-page.empty')}>
			{filteredCampaigns.map((campaign) => (
				<CardGridItem key={campaign.id}>
					<CampaignPreviewWallet campaign={campaign} stats={statsById[campaign.id]} lang={lang} currency={currency} />
				</CardGridItem>
			))}
		</CardGrid>
	);

	if (!searchParams) {
		return grid;
	}

	return (
		<div className="flex w-full flex-col gap-8">
			<div className="flex justify-end">
				<CreateCampaignButton
					label={t('campaigns-page.create-campaign')}
					labels={buildCampaignSubmissionLabels(t)}
					lang={lang}
					currency={currency}
				/>
			</div>
			<OverviewFilterBar
				filters={<StatusFilter statuses={statuses} selectedStatus={selectedStatus} />}
				totalCount={campaigns.length}
				showFilters={showFilters}
				countLabel={t('campaigns-page.campaign-count', { count: filteredCampaigns.length })}
				search={{
					label: t('campaigns-page.search-label'),
					placeholder: t('campaigns-page.search-placeholder'),
					compactPlaceholder: t('campaigns-page.search-placeholder-count', { count: filteredCampaigns.length }),
					query: searchQuery,
				}}
			>
				{grid}
			</OverviewFilterBar>
		</div>
	);
};

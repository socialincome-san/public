import { CampaignPreviewWallet } from '@/components/campaign/campaign-preview-wallet';
import { CampaignsOverviewFilters } from '@/components/campaign/campaigns-overview-filters';
import { CreateCampaignButton } from '@/components/campaign/create-campaign-button';
import { CmsHeader } from '@/components/storyblok/shared/cms-header';
import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
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
						comingSoonLabel={translator.t('campaigns-page.coming-soon')}
					/>
				</div>
			) : null}
			{campaigns.length === 0 ? (
				<p className="text-muted-foreground">{translator.t('campaigns-page.empty')}</p>
			) : (
				<ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{campaigns.map((campaign) => (
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

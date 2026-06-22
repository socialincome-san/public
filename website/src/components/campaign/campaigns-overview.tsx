import { getCampaignWalletFooterProps } from '@/components/campaign/campaign-wallet-footer';
import { CmsHeader } from '@/components/storyblok/shared/cms-header';
import { Wallet } from '@/components/wallet/wallet';
import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import type { PublicCampaignCard, PublicCampaignStatsMap } from '@/lib/services/campaign/campaign.types';
import { NEW_WEBSITE_SLUG } from '@/lib/utils/const';

type Props = {
	campaigns: PublicCampaignCard[];
	statsById: PublicCampaignStatsMap;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
	title?: string;
	text?: string;
};

export const CampaignsOverview = async ({ campaigns, statsById, lang, region, title, text }: Props) => {
	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-common'] });
	const t = (key: string) => translator.t(key);
	const hasCmsHeader = Boolean(title?.trim()) || Boolean(text?.trim());

	return (
		<div className="flex w-full flex-col gap-8">
			{hasCmsHeader ? <CmsHeader title={title} text={text} /> : null}
			{campaigns.length === 0 ? (
				<p className="text-muted-foreground">{t('campaigns-page.empty')}</p>
			) : (
				<ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
					{campaigns.map((campaign) => (
						<li key={campaign.id} className="h-full">
							<Wallet
								href={`/${lang}/${region}/${NEW_WEBSITE_SLUG}/campaigns/${campaign.slug}`}
								title={campaign.title}
								{...getCampaignWalletFooterProps(statsById[campaign.id], t)}
							/>
						</li>
					))}
				</ul>
			)}
		</div>
	);
};

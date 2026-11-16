import { CampaignsGridSection } from '@/components/campaign/campaigns-grid-section';
import { getTeaserCampaigns } from '@/components/campaign/get-teaser-campaigns';
import type { WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { getWebsiteBasePath } from '@/lib/i18n/utils';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import { getTranslations } from 'next-intl/server';

type Props = {
	currentCampaignSlug: string;
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
};

export const CampaignOtherCampaignsTeaser = async ({ currentCampaignSlug, lang, currency }: Props) => {
	const [t, data] = await Promise.all([getTranslations('website-campaign'), getTeaserCampaigns(lang, currentCampaignSlug)]);

	if (data.campaigns.length === 0) {
		return null;
	}

	return (
		<BlockWrapper>
			<CampaignsGridSection
				heading={
					<>
						{t('campaign.other-campaigns.heading-prefix')}
						<strong>{t('campaign.other-campaigns.heading-emphasis')}</strong>
					</>
				}
				data={data}
				lang={lang}
				currency={currency}
				cta={{
					href: `${getWebsiteBasePath(lang, currency)}/campaigns`,
					label: t('campaign.other-campaigns.show-all'),
				}}
			/>
		</BlockWrapper>
	);
};

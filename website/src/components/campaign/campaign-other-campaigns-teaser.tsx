import { BlockWrapper } from '@/components/block-wrapper';
import { CampaignsGridSection } from '@/components/campaign/campaigns-grid-section';
import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import { NEW_WEBSITE_SLUG } from '@/lib/utils/const';

const TEASER_LIMIT = 3;

type Props = {
	currentCampaignSlug: string;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
};

export const CampaignOtherCampaignsTeaser = async ({ currentCampaignSlug, lang, region }: Props) => {
	const [translator, dataResult] = await Promise.all([
		Translator.getInstance({ language: lang, namespaces: ['website-campaign'] }),
		services.read.campaign.getOtherPublicCampaignsWithStats(currentCampaignSlug, TEASER_LIMIT),
	]);

	if (!dataResult.success || dataResult.data.campaigns.length === 0) {
		return null;
	}

	return (
		<BlockWrapper>
			<CampaignsGridSection
				heading={
					<>
						{translator.t('campaign.other-campaigns.heading-prefix')}
						<strong>{translator.t('campaign.other-campaigns.heading-emphasis')}</strong>
					</>
				}
				data={dataResult.data}
				lang={lang}
				region={region}
				cta={{
					href: `/${lang}/${region}/${NEW_WEBSITE_SLUG}/campaigns`,
					label: translator.t('campaign.other-campaigns.show-all'),
				}}
			/>
		</BlockWrapper>
	);
};

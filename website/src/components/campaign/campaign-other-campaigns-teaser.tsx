import { BlockWrapper } from '@/components/block-wrapper';
import { CampaignsGridSection } from '@/components/campaign/campaigns-grid-section';
import { Translator } from '@/lib/i18n/translator';
import { getWebsiteRootParams } from '@/lib/i18n/website-root-params';
import { services } from '@/lib/services/services';

const TEASER_LIMIT = 3;

type Props = {
	currentCampaignSlug: string;
};

export const CampaignOtherCampaignsTeaser = async ({ currentCampaignSlug }: Props) => {
	const { lang, region } = await getWebsiteRootParams();
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
				cta={{
					href: `/${lang}/${region}/campaigns`,
					label: translator.t('campaign.other-campaigns.show-all'),
				}}
			/>
		</BlockWrapper>
	);
};

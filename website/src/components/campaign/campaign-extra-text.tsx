import { buildTwoColumnTextBlok } from '@/components/campaign/campaign-blok-builders';
import { TwoColumnTextBlock } from '@/components/content-blocks/two-column-text';
import type { CampaignPage } from '@/lib/services/campaign/campaign.types';

type Props = {
	campaign: CampaignPage;
};

export const CampaignExtraText = ({ campaign }: Props) => (
	<TwoColumnTextBlock
		blok={buildTwoColumnTextBlok(
			{ title: campaign.secondDescriptionTitle ?? '', text: campaign.secondDescription ?? '' },
			{ title: campaign.thirdDescriptionTitle ?? '', text: campaign.thirdDescription ?? '' },
		)}
	/>
);

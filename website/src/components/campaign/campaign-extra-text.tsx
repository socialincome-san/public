import { BlockWrapper } from '@/components/block-wrapper';
import { TwoColumnTextContent } from '@/components/content-blocks/two-column-text-content';
import type { CampaignPage } from '@/lib/services/campaign/campaign.types';
import { titledParagraphRichText } from '@/lib/storyblok/plain-text-rich-text';

type Props = {
	campaign: CampaignPage;
};

export const CampaignExtraText = ({ campaign }: Props) => (
	<BlockWrapper>
		<TwoColumnTextContent
			leftText={titledParagraphRichText(campaign.secondDescriptionTitle ?? '', campaign.secondDescription ?? '')}
			rightText={titledParagraphRichText(campaign.thirdDescriptionTitle ?? '', campaign.thirdDescription ?? '')}
		/>
	</BlockWrapper>
);

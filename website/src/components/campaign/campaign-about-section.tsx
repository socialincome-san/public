import { buildVideoTextBlok } from '@/components/campaign/campaign-blok-builders';
import { VideoTextBlock } from '@/components/content-blocks/video-text';
import type { Translator } from '@/lib/i18n/translator';

type Props = {
	translator: Translator;
};

export const CampaignAboutSection = ({ translator }: Props) => (
	<VideoTextBlock
		blok={buildVideoTextBlok(
			translator.t('campaign.about-si-title'),
			[translator.t('campaign.about-si-text-1'), translator.t('campaign.about-si-text-2')],
			Number(translator.t('id.video-01')),
		)}
	/>
);

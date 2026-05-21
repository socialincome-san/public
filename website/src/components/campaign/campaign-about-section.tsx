import { BlockWrapper } from '@/components/block-wrapper';
import { VideoTextContent } from '@/components/content-blocks/video-text-content';
import type { Translator } from '@/lib/i18n/translator';
import { headingAndParagraphsRichText } from '@/lib/storyblok/plain-text-rich-text';
import { VimeoVideoMatchAndExtract } from '@/lib/utils/UrlVideoParser';

const vimeoParser = new VimeoVideoMatchAndExtract();

type Props = {
	translator: Translator;
};

export const CampaignAboutSection = ({ translator }: Props) => {
	const vimeoEmbedUrl = vimeoParser.parseUrl(`https://vimeo.com/${translator.t('id.video-01')}`);

	if (!vimeoEmbedUrl) {
		return null;
	}

	return (
		<BlockWrapper>
			<VideoTextContent
				content={headingAndParagraphsRichText(translator.t('campaign.about-si-title'), [
					translator.t('campaign.about-si-text-1'),
					translator.t('campaign.about-si-text-2'),
				])}
				vimeoEmbedUrl={vimeoEmbedUrl}
				layout="videoRight"
			/>
		</BlockWrapper>
	);
};

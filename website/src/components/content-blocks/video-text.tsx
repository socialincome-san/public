import { BlockWrapper } from '@/components/block-wrapper';
import { VideoTextContent } from '@/components/content-blocks/video-text-content';
import type { VideoText } from '@/generated/storyblok/types/109655/storyblok-components';
import { VimeoVideoMatchAndExtract } from '@/lib/utils/UrlVideoParser';
import { storyblokEditable, type SbBlokData } from '@storyblok/react';

type Props = {
	blok: VideoText;
};

const vimeoParser = new VimeoVideoMatchAndExtract();

export const VideoTextBlock = ({ blok }: Props) => {
	const vimeoEmbedUrl = blok.vimeoLink?.url ? vimeoParser.parseUrl(blok.vimeoLink.url) : null;

	if (!blok.content || !vimeoEmbedUrl) {
		return null;
	}

	return (
		<BlockWrapper {...storyblokEditable(blok as SbBlokData)}>
			<VideoTextContent
				content={blok.content}
				vimeoEmbedUrl={vimeoEmbedUrl}
				layout={blok.layout === 'videoLeft' ? 'videoLeft' : 'videoRight'}
			/>
		</BlockWrapper>
	);
};

import { blockMargins } from '@/components/content-blocks/block-margins';
import { MuxVideoCarousel } from '@/components/mux-video-carousel/mux-video-carousel';
import { StoryblokMarkdown } from '@/components/storyblok-markdown';
import type { VideoCarousel } from '@/generated/storyblok/types/109655/storyblok-components';
import { normalizeMuxPlaybackId } from '@/lib/utils/url-video-parser';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import { storyblokEditable } from '@storyblok/react';

type Props = {
	blok: VideoCarousel;
};

export const VideoCarouselBlock = ({ blok }: Props) => {
	const videos = (blok.videos ?? []).flatMap((video) => {
		const playbackId = normalizeMuxPlaybackId(video.playbackId ?? '');

		return playbackId ? [{ id: video._uid, playbackId, title: video.title }] : [];
	});
	if (videos.length === 0) {
		return null;
	}

	return (
		<BlockWrapper width="bleed" {...blockMargins(blok)} {...storyblokEditable(blok)}>
			<MuxVideoCarousel
				title={blok.heading?.trim() ? <StoryblokMarkdown>{blok.heading}</StoryblokMarkdown> : undefined}
				description={blok.description}
				videos={videos}
			/>
		</BlockWrapper>
	);
};

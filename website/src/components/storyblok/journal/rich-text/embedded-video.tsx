import type { EmbeddedVideo } from '@/generated/storyblok/types/109655/storyblok-components';
import { VimeoVideoMatchAndExtract, YouTubeVideoMatchAndExtract } from '@/lib/utils/UrlVideoParser';

const videoMatchers = [new YouTubeVideoMatchAndExtract(), new VimeoVideoMatchAndExtract()];

const getMuxPlayerUrl = (muxPlaybackId: string | undefined) => muxPlaybackId && `https://player.mux.com/${muxPlaybackId}`;

export const EmbeddedVideoPlayer = ({ caption, muxPlaybackId, url, _uid }: EmbeddedVideo) => {
	const videoUrl = url
		? videoMatchers.map((matcher) => matcher.parseUrl(url)).find(Boolean)
		: getMuxPlayerUrl(muxPlaybackId);

	if (!videoUrl) {
		return null;
	}

	return (
		<figure className="my-8 w-full">
			<iframe
				key={`embedded-video-${_uid}`}
				src={videoUrl}
				title="Video player"
				sandbox="allow-scripts allow-same-origin allow-presentation"
				allow="fullscreen"
				loading="lazy"
				className="aspect-video w-full rounded-xl border-0"
			/>
			{caption && <figcaption className="text-muted-foreground mt-3 text-sm">{caption}</figcaption>}
		</figure>
	);
};

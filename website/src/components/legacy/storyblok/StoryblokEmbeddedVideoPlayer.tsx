import type { EmbeddedVideo } from '@/generated/storyblok/types/109655/storyblok-components';
import { VimeoVideoMatchAndExtract, YouTubeVideoMatchAndExtract } from '@/lib/utils/UrlVideoParser';
import { Typography } from '@socialincome/ui';

const SUPPORTED_VIDEO_PROVIDERS_MATCHERS = [new YouTubeVideoMatchAndExtract(), new VimeoVideoMatchAndExtract()];

const getMuxPlayerUrl = (muxPlaybackId: string | undefined) => muxPlaybackId && `https://player.mux.com/${muxPlaybackId}`;

export const StoryblokEmbeddedVideoPlayer = ({ caption, muxPlaybackId, url, _uid }: EmbeddedVideo) => {
  const videoUrl = url
    ? SUPPORTED_VIDEO_PROVIDERS_MATCHERS.map((it) => it.parseUrl(url)).find((it) => !!it)
    : getMuxPlayerUrl(muxPlaybackId);

  return (
    videoUrl && (
      <div className="w-full px-0 py-4">
        <iframe
          key={`embeddedVideoPlayer${_uid}`}
          src={videoUrl}
          title="Video player"
          sandbox="allow-scripts allow-same-origin allow-presentation "
          allow="fullscreen"
          loading="lazy"
          className="mb-2 aspect-video h-full w-full border-0"
        />
        {caption && (
          <Typography size="xs" className="m-0 mt-2 pt-4 text-left">
            {caption}
          </Typography>
        )}
      </div>
    )
  );
};

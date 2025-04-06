import { Typography } from './typography';

function extractYouTubeId(url: string): string | null {
	const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
	return match ? match[1] : null;
}

function extractVimeoId(url: string): string | null {
	const cleanedUrl = url.split('?')[0].split('#')[0];
	const match = cleanedUrl.match(/vimeo\.com\/(?:video\/)?(\d+)/);
	return match ? match[1] : null;
}

export function VideoEmbedWithCaption({
																				urlVideo,
																				caption,
																				muxPlaybackId,
																			}: {
	urlVideo?: string;
	caption?: string;
	muxPlaybackId?: string;
}) {
	const videoId = urlVideo ? extractYouTubeId(urlVideo) : null;
	const vimeoId = urlVideo ? extractVimeoId(urlVideo) : null;
	const isYouTube = !!videoId;
	const isVimeo = !!vimeoId;
	const isMux = !!muxPlaybackId;

	if (!isYouTube && !isVimeo && !isMux) return null;

	const embeds = [];

	if (isYouTube) {
		embeds.push(
			<iframe
				key="youtube"
				src={`https://www.youtube.com/embed/${videoId}`}
				title="YouTube video player"
				allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
				allowFullScreen
				className="h-full w-full border-0 aspect-video mb-2"
			/>
		);
	}

	if (isVimeo) {
		embeds.push(
			<iframe
				key="vimeo"
				src={`https://player.vimeo.com/video/${vimeoId}`}
				title="Vimeo video player"
				allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
				allowFullScreen
				className="h-full w-full border-0 aspect-video mb-2"
			/>
		);
	}

	if (isMux) {
		embeds.push(
			<iframe
				key="mux"
				src={`https://player.mux.com/${muxPlaybackId}`}
				title="MUX video player"
				allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
				allowFullScreen
				style={{ width: '100%', border: 'none', aspectRatio: '16/9' }}
				className="mb-2"
			/>
		);
	}

	return (
		<div className="w-full px-0 py-4">
			{embeds}
			{caption && (
				<Typography size="xs" className="m-0 mt-2 pt-4 text-left">
					{caption}
				</Typography>
			)}
		</div>
	);
}
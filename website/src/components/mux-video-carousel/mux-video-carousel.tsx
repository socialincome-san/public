import { getMuxPosterUrl } from '@/lib/utils/url-video-parser';
import MuxVideo from '@mux/mux-video-react';
import { VideoCarousel } from '@socialincome/design-system/data-display/video-carousel/video-carousel';
import { getTranslations } from 'next-intl/server';
import { type ReactNode } from 'react';

type Props = {
	title?: ReactNode;
	description?: string;
	videos: { id: string; playbackId: string; title: string }[];
};

const POSTER_WIDTH = 1280;

export const MuxVideoCarousel = async ({ title, description, videos }: Props) => {
	const t = await getTranslations('website-common');

	return (
		<VideoCarousel
			title={title}
			description={description}
			items={videos.map((video, index) => ({
				id: video.id,
				title: video.title,
				posterSrc: getMuxPosterUrl(video.playbackId, POSTER_WIDTH),
				selectLabel: t('video-carousel.show-video', { index: index + 1 }),
				video: (
					<MuxVideo
						playbackId={video.playbackId}
						title={video.title}
						poster={getMuxPosterUrl(video.playbackId, POSTER_WIDTH)}
						disableCookies
						controls
						preload="metadata"
						playsInline
					/>
				),
			}))}
		/>
	);
};

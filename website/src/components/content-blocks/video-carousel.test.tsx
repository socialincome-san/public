import type { MuxVideo, VideoCarousel } from '@/generated/storyblok/types/109655/storyblok-components';
import { renderToStaticMarkup } from 'react-dom/server';
import { VideoCarouselBlock } from './video-carousel';

jest.mock('@/components/mux-video-carousel/mux-video-carousel', () => ({
	MuxVideoCarousel: ({ videos }: { videos: { playbackId: string }[] }) => (
		<ul>
			{videos.map((video) => (
				<li key={video.playbackId}>{video.playbackId}</li>
			))}
		</ul>
	),
}));

jest.mock('@/components/storyblok-markdown', () => ({
	StoryblokMarkdown: ({ children }: { children: string }) => children,
}));

jest.mock('@storyblok/react', () => ({
	storyblokEditable: jest.fn(() => ({})),
}));

const video = (playbackId: string): MuxVideo => ({ component: 'muxVideo', _uid: playbackId, playbackId, title: 'Video' });

const render = (videos: MuxVideo[]) => {
	const blok: VideoCarousel = { component: 'videoCarousel', _uid: 'carousel', videos };
	const element = VideoCarouselBlock({ blok });

	return element ? renderToStaticMarkup(element) : null;
};

test('passes the playback IDs, also when editors paste a player link', () => {
	const markup = render([video('abc123'), video('https://player.mux.com/def456?autoplay=1')]);

	expect(markup).toContain('<li>abc123</li>');
	expect(markup).toContain('<li>def456</li>');
});

test('renders nothing without a usable video', () => {
	expect(render([video('  ')])).toBeNull();
});

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { VideoCarousel } from './video-carousel';

const posters = [
	'/assets/storybook/timeline-donor.webp',
	'/assets/storybook/timeline-recipient.webp',
	'/assets/storybook/timeline-decide.webp',
];

const items = posters.map((posterSrc, index) => ({
	id: `video-${index + 1}`,
	title: `Recipient video ${index + 1}`,
	posterSrc,
	selectLabel: `Show video ${index + 1}`,
	video: <video controls poster={posterSrc} aria-label={`Recipient video ${index + 1}`} />,
}));

const meta = {
	title: 'Data Display/Video Carousel',
	component: VideoCarousel,
	tags: ['autodocs'],
	parameters: {
		layout: 'fullscreen',
		docs: {
			description: {
				component:
					'Videos in a carousel with a heading. Only the active slide renders its player; the others show their poster. The bars below switch between the videos.',
			},
		},
	},
	args: {
		title: (
			<>
				What does it mean to receive a <strong>Social Income</strong>?
			</>
		),
		description: 'Hear directly from recipients across our programs what Social Income means in practice.',
		items,
	},
} satisfies Meta<typeof VideoCarousel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SingleVideo: Story = {
	args: { items: items.slice(0, 1) },
};

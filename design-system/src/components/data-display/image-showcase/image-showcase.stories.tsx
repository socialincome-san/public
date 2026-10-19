import { type Meta, type StoryObj } from '@storybook/nextjs-vite';
import { ImageShowcase } from './image-showcase';

const meta = {
	title: 'Data Display/Image Showcase',
	component: ImageShowcase,
	tags: ['autodocs'],
	parameters: { docs: { description: { component: 'A responsive four-image collage with gently rotated frames.' } } },
} satisfies Meta<typeof ImageShowcase>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		images: [
			{ src: '/assets/flags/sl.svg', alt: 'Example image 1' },
			{ src: '/assets/flags/sl.svg', alt: 'Example image 2' },
			{ src: '/assets/flags/sl.svg', alt: 'Example image 3' },
			{ src: '/assets/flags/sl.svg', alt: 'Example image 4' },
		],
	},
};

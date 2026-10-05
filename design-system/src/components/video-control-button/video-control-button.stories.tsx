import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { VideoControlButton } from './video-control-button';

const meta = {
	title: 'Components/VideoControlButton',
	component: VideoControlButton,
	tags: ['autodocs'],
	args: {
		'aria-label': 'Play video',
		children: '▶',
	},
} satisfies Meta<typeof VideoControlButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

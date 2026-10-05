import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { BlockWrapper } from './block-wrapper';

const meta = {
	title: 'Components/BlockWrapper',
	component: BlockWrapper,
	tags: ['autodocs'],
	parameters: {
		layout: 'fullscreen',
	},
} satisfies Meta<typeof BlockWrapper>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		disableMarginTop: true,
		disableMarginBottom: true,
		children: 'Page content stays inside the site width.',
	},
};

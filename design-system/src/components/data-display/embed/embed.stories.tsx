import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Embed } from './embed';

const meta = {
	title: 'Data Display/Embed',
	component: Embed,
	tags: ['autodocs'],
	args: {
		src: 'https://www.youtube-nocookie.com/embed/ScMzIvxBSi4',
		title: 'Video player',
	},
	parameters: {
		docs: {
			description: {
				component:
					'A sandboxed iframe for third-party content such as calendars, charts or videos, with an optional caption. Full width; a fixed height or 16:9.',
			},
		},
	},
} satisfies Meta<typeof Embed>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const FixedHeight: Story = {
	args: {
		src: 'https://dataembed.worldbank.org/data360/embed?view=map&indicatorID=WB_WDI_SL_TLF_CACT_FE_ZS',
		title: 'Female labor force participation',
		height: 620,
	},
};

export const WithCaption: Story = {
	args: { caption: 'A caption below the frame.' },
};

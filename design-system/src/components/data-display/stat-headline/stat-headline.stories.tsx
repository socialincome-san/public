import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { StatHeadline } from './stat-headline';

const meta = {
	title: 'Data Display/StatHeadline',
	component: StatHeadline,
	tags: ['autodocs'],
	args: {
		title: 'Available Credits',
		value: '4.5 intervals',
		info: { label: 'Show available intervals calculation', content: 'Available credits divided by cost per interval.' },
	},
	parameters: {
		docs: {
			description: {
				component: 'The key figure of a StatPanel.',
			},
		},
	},
} satisfies Meta<typeof StatHeadline>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

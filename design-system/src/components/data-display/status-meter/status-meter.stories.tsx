import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { StatusMeter } from './status-meter';

const meta = {
	title: 'Data Display/Status Meter',
	component: StatusMeter,
	tags: ['autodocs'],
	parameters: {
		docs: {
			description: {
				component:
					'One dot per check and a short score, to sum up several statuses at a glance, such as in a collapsed list item.',
			},
		},
	},
} satisfies Meta<typeof StatusMeter>;

export default meta;

type Story = StoryObj<typeof meta>;

export const AllPositive: Story = {
	args: {
		items: [
			{ label: 'Markets', status: 'positive' },
			{ label: 'Mobile money', status: 'positive' },
			{ label: 'Network', status: 'positive' },
			{ label: 'Sanctions', status: 'positive' },
		],
		label: '4/4',
		description: '4 of 4 conditions met',
	},
};

export const Mixed: Story = {
	args: {
		items: [
			{ label: 'Markets', status: 'positive' },
			{ label: 'Mobile money', status: 'caution' },
			{ label: 'Network', status: 'negative' },
			{ label: 'Sanctions', status: 'positive' },
		],
		label: '2/4',
		description: '2 of 4 conditions met',
	},
};

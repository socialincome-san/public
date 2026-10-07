import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { StatProgress } from './stat-progress';

const meta = {
	title: 'Data Display/StatProgress',
	component: StatProgress,
	tags: ['autodocs'],
	args: {
		title: 'Contributions Progress',
		start: { label: 'Total Contributions', value: 'CHF 48’200', info: 'Sum of succeeded contributions.' },
		end: { label: 'Total Program Cost', value: 'CHF 120’000' },
		percent: 40.2,
	},
	parameters: {
		docs: {
			description: {
				component: 'Progress from a current value towards a target, with the percentage below the bar.',
			},
		},
	},
	decorators: [
		(Story) => (
			<div className="w-96">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof StatProgress>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Exceeded: Story = {
	args: { percent: 132.5 },
};

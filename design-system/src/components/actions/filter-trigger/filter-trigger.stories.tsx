import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { FilterTrigger } from './filter-trigger';

const meta = {
	title: 'Actions/FilterTrigger',
	component: FilterTrigger,
	tags: ['autodocs'],
	args: {
		children: 'All countries',
	},
	parameters: {
		docs: {
			description: {
				component: 'Pill-shaped trigger for filter dropdowns. Fills the width of its container.',
			},
		},
	},
	decorators: [
		(Story) => (
			<div className="w-56">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof FilterTrigger>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Active: Story = {
	args: {
		active: true,
		children: 'Sierra Leone',
	},
};

import { RunwayMonth } from '@/components/runway-month/runway-month';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const meta = {
	title: 'Components/RunwayMonth',
	component: RunwayMonth,
	tags: ['autodocs'],
	parameters: {
		docs: {
			description: {
				component: 'A reusable component to display a month and year with a checkmark.',
			},
		},
	},
	argTypes: {
		month: {
			control: 'text',
		},
		year: {
			control: 'number',
		},
	},
} satisfies Meta<typeof RunwayMonth>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		month: 'January',
		year: 2024,
	},
};

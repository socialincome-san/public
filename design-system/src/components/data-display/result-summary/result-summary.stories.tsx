import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ResultSummary } from './result-summary';

const meta = {
	title: 'Data Display/ResultSummary',
	component: ResultSummary,
	tags: ['autodocs'],
	parameters: {
		docs: {
			description: {
				component:
					'The outcome of a calculator: a label, a large value with an optional suffix, and an optional note. Announces changes to screen readers.',
			},
		},
	},
} satisfies Meta<typeof ResultSummary>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithProjection: Story = {
	args: {
		label: 'Your 1%',
		currency: 'CHF',
		value: '59',
		suffix: '/ month',
		children: 'CHF 708 in one year',
	},
};

export const ValueOnly: Story = {
	args: {
		label: 'Your donation',
		value: 'EUR 50',
	},
};

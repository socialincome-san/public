import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { TermList } from './term-list';

const meta = {
	title: 'Data Display/Term List',
	component: TermList,
	tags: ['autodocs'],
	args: {
		title: 'Program terms',
		items: [
			{ label: 'Duration', value: '36 months' },
			{ label: 'Payout amount', value: '700' },
			{ label: 'Payout currency', value: 'SLE' },
			{ label: 'Payout interval', value: 'Monthly' },
		],
	},
	parameters: {
		docs: {
			description: {
				component: 'A titled list of read-only label and value pairs, separated by dividers.',
			},
		},
	},
} satisfies Meta<typeof TermList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SingleTerm: Story = {
	args: {
		items: [{ label: 'Duration', value: '12 months' }],
	},
};

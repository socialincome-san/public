import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { AmountDisplay } from './amount-display';

const meta = {
	title: 'Data Display/Amount Display',
	component: AmountDisplay,
	tags: ['autodocs'],
	args: {
		label: 'Your 1 %',
		currency: 'CHF',
		value: '59',
	},
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component: 'A large amount with its label and currency, optionally with a suffix and a note below.',
			},
		},
	},
} satisfies Meta<typeof AmountDisplay>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithSuffixAndNote: Story = {
	args: {
		suffix: 'per month',
		children: 'CHF 708 in one year',
	},
};

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { fn } from 'storybook/test';
import { AmountSlider } from './amount-slider';

const meta = {
	title: 'Forms/AmountSlider',
	component: AmountSlider,
	tags: ['autodocs'],
	parameters: {
		docs: {
			description: {
				component: 'A large amount with a slider below it, for picking one amount as the main action of a page.',
			},
		},
	},
} satisfies Meta<typeof AmountSlider>;

export default meta;

type Story = StoryObj<typeof meta>;

const Controlled = (args: React.ComponentProps<typeof AmountSlider>) => {
	const [value, setValue] = useState(args.value);

	return <AmountSlider {...args} value={value} formattedValue={value.toLocaleString('de-CH')} onValueChange={setValue} />;
};

export const MonthlyIncome: Story = {
	args: {
		label: 'Your monthly income',
		currency: 'CHF',
		value: 5930,
		formattedValue: '5’930',
		min: 1000,
		max: 15000,
		step: 10,
		onValueChange: fn(),
	},
	render: Controlled,
};

export const OwnAmount: Story = {
	args: {
		label: 'Amount',
		currency: 'EUR',
		value: 50,
		formattedValue: '50',
		min: 10,
		max: 500,
		step: 5,
		onValueChange: fn(),
	},
	render: Controlled,
};

export const Inactive: Story = {
	args: { ...MonthlyIncome.args, inactive: true },
	render: Controlled,
};

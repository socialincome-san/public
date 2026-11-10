import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { AmountSlider } from './amount-slider';

const meta = {
	title: 'Forms/Amount Slider',
	component: AmountSlider,
	tags: ['autodocs'],
	args: {
		label: 'Your monthly income',
		currency: 'CHF',
		value: 5000,
		formattedValue: '5,000',
		min: 1000,
		max: 15000,
		step: 50,
		onValueChange: () => undefined,
	},
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component:
					'A large amount picked with a slider. Fades while another way of choosing the amount is active and calls `onActivate` on touch or focus.',
			},
		},
	},
} satisfies Meta<typeof AmountSlider>;

export default meta;

type Story = StoryObj<typeof meta>;

const InteractiveAmountSlider = (args: React.ComponentProps<typeof AmountSlider>) => {
	const [value, setValue] = useState(args.value);

	return <AmountSlider {...args} value={value} formattedValue={value.toLocaleString('en')} onValueChange={setValue} />;
};

export const Default: Story = {
	render: (args) => <InteractiveAmountSlider {...args} />,
};

export const Inactive: Story = {
	args: { inactive: true },
};

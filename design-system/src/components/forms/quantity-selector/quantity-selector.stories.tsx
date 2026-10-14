import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';

import { QuantitySelector } from './quantity-selector';

const meta = {
	title: 'Forms/Quantity Selector',
	component: QuantitySelector,
	tags: ['autodocs'],
	args: {
		label: 'Quantity',
		value: 4,
		min: 1,
		max: 12,
		onChange: () => undefined,
	},
	parameters: {
		docs: {
			description: {
				component: 'A number input and slider for choosing a quantity inside a fixed range.',
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
} satisfies Meta<typeof QuantitySelector>;

export default meta;

type Story = StoryObj<typeof meta>;

const InteractiveQuantity = ({ max, atMaxHint }: { max: number; atMaxHint?: string }) => {
	const [value, setValue] = useState(Math.min(4, max));

	return <QuantitySelector label="Quantity" value={value} min={1} max={max} onChange={setValue} atMaxHint={atMaxHint} />;
};

export const Default: Story = {
	render: () => <InteractiveQuantity max={12} />,
};

export const AtMaximum: Story = {
	args: {
		value: 12,
		atMaxHint: 'This is the maximum available.',
	},
};

export const Disabled: Story = {
	args: {
		disabled: true,
	},
};

export const Empty: Story = {
	args: {
		value: 0,
		max: 0,
		emptyMessage: 'Nothing is available to select.',
	},
};

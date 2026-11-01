import { type Meta, type StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { fn } from 'storybook/test';
import { AspectRatioSelect } from './aspect-ratio-select';

const meta = {
	title: 'Forms/Aspect Ratio Select',
	component: AspectRatioSelect,
	tags: ['autodocs'],
	parameters: {
		docs: {
			description: {
				component: 'Compact, keyboard-accessible format selector with proportional previews and a selected-item checkmark.',
			},
		},
	},
	args: {
		label: 'Aspect ratio',
		value: '1:1',
		onValueChange: fn(),
		items: [
			{ value: '1:1', label: 'Square', width: 1, height: 1 },
			{ value: '16:9', label: 'Widescreen', width: 16, height: 9 },
			{ value: '9:16', label: 'Portrait', width: 9, height: 16 },
			{ value: '4:3', label: 'Landscape', width: 4, height: 3 },
			{ value: '3:4', label: 'Portrait', width: 3, height: 4 },
			{ value: '3:2', label: 'Photography', width: 3, height: 2 },
		],
	},
	render: function Render(args) {
		const [value, setValue] = useState(args.value);

		return (
			<div className="w-56">
				<AspectRatioSelect {...args} value={value} onValueChange={setValue} />
			</div>
		);
	},
} satisfies Meta<typeof AspectRatioSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Portrait: Story = { args: { value: '9:16' } };
export const Disabled: Story = { args: { disabled: true } };

import { useState, type ComponentProps } from 'react';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { SegmentedToggle } from './segmented-toggle';

const twoOptions = [
	{ value: 'monthly', label: 'Monthly' },
	{ value: 'yearly', label: 'Yearly' },
];

const manyOptions = [...twoOptions, { value: 'one-time', label: 'One-time' }];

type SegmentedToggleStoryProps = Omit<ComponentProps<typeof SegmentedToggle>, 'onValueChange'>;

const InteractiveSegmentedToggle = ({ value: initialValue, options, ...args }: SegmentedToggleStoryProps) => {
	const [value, setValue] = useState(initialValue);

	return <SegmentedToggle {...args} options={options} value={value} onValueChange={setValue} />;
};

const meta = {
	title: 'Components/SegmentedToggle',
	component: InteractiveSegmentedToggle,
	tags: ['autodocs'],
	args: {
		options: twoOptions,
		value: 'monthly',
	},
	argTypes: {
		options: { control: false },
		value: {
			control: 'select',
			options: ['monthly', 'yearly', 'one-time'],
		},
	},
} satisfies Meta<typeof InteractiveSegmentedToggle>;

export default meta;

type Story = StoryObj<typeof meta>;

export const TwoOptions: Story = {};

export const ThreeOrMoreOptions: Story = {
	args: {
		options: manyOptions,
	},
};

export const SelectedChangeViaControls: Story = {
	args: {
		value: 'yearly',
	},
	render: (args) => <InteractiveSegmentedToggle key={args.value} {...args} />,
};

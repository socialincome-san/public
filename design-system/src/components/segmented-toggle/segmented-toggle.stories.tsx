import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';

import { SegmentedToggle } from './segmented-toggle';

const options = [
	{ value: 'monthly', label: 'Monthly' },
	{ value: 'once', label: 'Once' },
] as const;

const meta = {
	title: 'Components/SegmentedToggle',
	component: SegmentedToggle,
	tags: ['autodocs'],
} satisfies Meta<typeof SegmentedToggle>;

export default meta;

type Story = StoryObj<typeof meta>;

const SegmentedToggleExample = () => {
	const [value, setValue] = useState('monthly');

	return <SegmentedToggle options={options} value={value} onValueChange={setValue} />;
};

export const Default: Story = {
	args: {
		options,
		value: 'monthly',
		onValueChange: () => undefined,
	},
	render: () => <SegmentedToggleExample />,
};

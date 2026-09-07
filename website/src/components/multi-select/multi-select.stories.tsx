import { useState, type ComponentProps } from 'react';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { MultiSelect } from './multi-select';

const options = [
	{ label: 'Switzerland', value: 'ch' },
	{ label: 'Germany', value: 'de' },
	{ label: 'Kenya', value: 'ke' },
	{ label: 'India', value: 'in' },
	{ label: 'Ghana', value: 'gh' },
];

type MultiSelectStoryArgs = Omit<ComponentProps<typeof MultiSelect>, 'onValueChange'>;

const InteractiveMultiSelect = (args: MultiSelectStoryArgs) => {
	const [selected, setSelected] = useState(args.defaultValue ?? []);

	return <MultiSelect {...args} defaultValue={selected} onValueChange={setSelected} />;
};

const meta = {
	title: 'Components/MultiSelect',
	component: InteractiveMultiSelect,
	tags: ['autodocs'],
	args: {
		options,
		placeholder: 'Select countries',
	},
} satisfies Meta<typeof InteractiveMultiSelect>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const SeveralSelected: Story = {
	args: {
		defaultValue: ['ch', 'de', 'ke'],
	},
};

export const Disabled: Story = {
	args: {
		disabled: true,
	},
};

export const SearchNoResults: Story = {
	args: {
		searchable: true,
	},
};

export const Overflow: Story = {
	args: {
		defaultValue: ['ch', 'de', 'ke', 'in'],
		maxCount: 2,
	},
};

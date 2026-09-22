import { useState, type ComponentProps } from 'react';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Combobox } from './combo-box';

const options = [
	{ id: 'switzerland', label: 'Switzerland' },
	{ id: 'germany', label: 'Germany' },
	{ id: 'france', label: 'France' },
];

type ComboboxStoryProps = Omit<ComponentProps<typeof Combobox>, 'value' | 'onChange'>;

const InteractiveCombobox = ({ options: storyOptions = options, ...args }: ComboboxStoryProps) => {
	const [value, setValue] = useState<string>();

	return <Combobox {...args} options={storyOptions} value={value} onChange={setValue} />;
};

const SelectedCombobox = (args: ComboboxStoryProps) => {
	const [value, setValue] = useState('switzerland');

	return <Combobox {...args} value={value} onChange={setValue} />;
};

const meta = {
	title: 'Components/Combobox',
	component: InteractiveCombobox,
	tags: ['autodocs'],
	args: {
		options,
		placeholder: 'Select a country',
	},
	argTypes: {
		options: { control: false },
	},
} satisfies Meta<typeof InteractiveCombobox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Selected: Story = {
	render: (args) => <SelectedCombobox {...args} />,
};

export const Disabled: Story = {
	args: {
		disabled: true,
	},
};

export const NoMatchingSearchResults: Story = {
	args: {
		options: [],
	},
};

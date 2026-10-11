import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';

import { Combobox } from './combo-box';

const options = [
	{ id: 'gh', label: 'Ghana' },
	{ id: 'sl', label: 'Sierra Leone' },
	{ id: 'ch', label: 'Switzerland' },
];

const meta = {
	title: 'Forms/Combobox',
	component: Combobox,
	tags: ['autodocs'],
} satisfies Meta<typeof Combobox>;

export default meta;

type Story = StoryObj<typeof meta>;

const ComboboxExample = () => {
	const [value, setValue] = useState<string | undefined>('gh');

	return <Combobox options={options} value={value} onChange={setValue} placeholder="Select a country" />;
};

export const Default: Story = {
	args: {
		options,
		value: 'gh',
		onChange: () => undefined,
	},
	render: () => <ComboboxExample />,
};

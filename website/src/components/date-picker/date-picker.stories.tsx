import { useState, type ComponentProps } from 'react';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { DatePicker } from './date-picker';

type DatePickerStoryArgs = Omit<ComponentProps<typeof DatePicker>, 'selected' | 'onSelect'>;

const InteractiveDatePicker = (args: DatePickerStoryArgs) => {
	const [selected, setSelected] = useState<Date>();

	return <DatePicker {...args} selected={selected} onSelect={setSelected} />;
};

const meta = {
	title: 'Components/DatePicker',
	component: InteractiveDatePicker,
	tags: ['autodocs'],
	args: {
		placeholder: 'Select date',
	},
	argTypes: {
		startMonth: {
			control: false,
		},
		endMonth: {
			control: false,
		},
	},
} satisfies Meta<typeof InteractiveDatePicker>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: (args: DatePickerStoryArgs) => <InteractiveDatePicker {...args} />,
};

export const Selected: Story = {
	args: {
		placeholder: 'Select date',
	},
	render: (args: DatePickerStoryArgs) => <DatePicker {...args} selected={new Date(2026, 8, 7)} onSelect={() => undefined} />,
};

export const Disabled: Story = {
	args: {
		disabled: true,
	},
	render: (args: DatePickerStoryArgs) => <InteractiveDatePicker {...args} />,
};

export const LimitedMonths: Story = {
	args: {
		startMonth: new Date(2026, 0),
		endMonth: new Date(2026, 11),
	},
	render: (args: DatePickerStoryArgs) => <InteractiveDatePicker {...args} />,
};

import type { ComponentProps } from 'react';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Checkbox } from './checkbox';

const meta = {
	title: 'Components/Checkbox',
	component: Checkbox,
	tags: ['autodocs'],
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/design/IDEMMGr7QkVOY4Ksbgbc57/Social-Income---shadcn-UI-Kit?node-id=46-67&p=f&t=uDt5Wmo7FudNnpiF-0',
		},
	},
} satisfies Meta<typeof Checkbox>;

export default meta;

type Story = StoryObj<typeof meta>;

const renderWithLabel = (args: ComponentProps<typeof Checkbox>) => (
	<label className="flex items-center gap-2">
		<Checkbox {...args} />
		<span>Accept terms and conditions</span>
	</label>
);

export const Default: Story = {
	render: renderWithLabel,
};

export const Checked: Story = {
	args: {
		checked: true,
	},
	render: renderWithLabel,
};

export const Indeterminate: Story = {
	args: {
		checked: 'indeterminate',
	},
	render: renderWithLabel,
};

export const Disabled: Story = {
	args: {
		disabled: true,
	},
	render: renderWithLabel,
};

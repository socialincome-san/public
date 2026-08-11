import { Input } from '@/components/input';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const meta = {
	title: 'Components/Input',
	tags: ['autodocs'],
	component: Input,

	args: {
		placeholder: 'Enter text',
		type: 'text',
	},

	argTypes: {
		type: {
			control: 'select',
			options: ['text', 'number', 'email', 'password', 'search'],
		},
		className: {
			control: 'text',
		},
		placeholder: {
			control: 'text',
		},
		disabled: {
			control: 'boolean',
		},
		readOnly: {
			control: 'boolean',
		},
	},

	parameters: {
		docs: {
			description: {
				component: 'A reusable input component for entering text, numbers, email addresses, passwords, and search queries.',
			},
		},
	},
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Disabled: Story = {
	args: {
		disabled: true,
	},
};

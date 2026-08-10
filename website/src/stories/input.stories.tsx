import { Input } from '@/components/input';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const meta = {
	title: 'Components/Input',
	tags: ['autodocs'],
	component: Input,
	args: {
		placeholder: 'Enter text',
		type: 'text',
		defaultValue: 'TestValue',
		docs: {
			description: {
				component:
					'Eine wiederverwendbare Input-Komponente für die Eingabe von Text, Zahlen, E-Mail-Adressen, Passwörtern und Suchanfragen.',
			},
		},
		argTypes: {
			parameters: {},
		},
		type: {
			control: 'select',
			options: ['text', 'number', 'email', 'password', 'search'],
		},
		defaultValue: {
			control: 'text',
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
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Disabled: Story = {
	args: {
		disabled: true,
	},
};

export const ReadOnly: Story = {
	args: {
		readOnly: true,
	},
};

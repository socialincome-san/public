import { Input } from '@/components/input';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { expect, userEvent } from 'storybook/test';

const meta = {
	title: 'Components/Input',
	tags: ['autodocs'],
	component: Input,

	args: {
		placeholder: 'Enter text',
		type: 'text',
		defaultValue: 'TestValue',
	},

	argTypes: {
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

	parameters: {
		docs: {
			codePanel: true,

			source: {
				code: `<Input
	  type="email"
	  placeholder="name@example.com"
	  defaultValue="test@example.com"
/>`,
			},
			description: {
				component:
					'Eine wiederverwendbare Input-Komponente für die Eingabe von Text, Zahlen, E-Mail-Adressen, Passwörtern und Suchanfragen.',
			},
		},
	},
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvas }) => {
		const input = await canvas.findByRole('textbox');

		await userEvent.type(input, ' Hallo');

		await expect(input).toHaveValue('TestValue Hallo');
	},
};

export const Disabled: Story = {
	args: {
		disabled: true,
	},
	play: async ({ canvas }) => {
		const input = await canvas.findByRole('textbox');

		await expect(input).toBeDisabled();
	},
};
export const ReadOnly: Story = {
	args: {
		readOnly: true,
	},
};

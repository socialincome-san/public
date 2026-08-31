import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { Switch } from './switch';

const meta = {
	title: 'Components/Switch',
	component: Switch,
	tags: ['autodocs'],
} satisfies Meta<typeof Switch>;

export default meta;

type Story = StoryObj<typeof meta>;

type SwitchStoryProps = {
	defaultChecked?: boolean;
	disabled?: boolean;
};

const InteractiveSwitch = ({ defaultChecked = false, disabled = false }: SwitchStoryProps) => {
	const [checked, setChecked] = useState(defaultChecked);

	return <Switch aria-label="Enable notifications" checked={checked} disabled={disabled} onCheckedChange={setChecked} />;
};

export const Default: Story = {
	args: {
		defaultChecked: false,
		disabled: false,
	},
	argTypes: {
		defaultChecked: {
			control: 'boolean',
		},
		disabled: {
			control: 'boolean',
		},
	},
	render: (args) => (
		<InteractiveSwitch
			key={`${args.defaultChecked}-${args.disabled}`}
			defaultChecked={args.defaultChecked}
			disabled={args.disabled}
		/>
	),
};

export const Checked: Story = {
	args: {
		'aria-label': 'Enable notifications',
		checked: true,
	},
};

export const Disabled: Story = {
	args: {
		defaultChecked: false,
		disabled: true,
	},
	argTypes: {
		defaultChecked: {
			control: 'boolean',
		},
		disabled: {
			control: 'boolean',
		},
	},
	render: (args) => (
		<InteractiveSwitch
			key={`${args.defaultChecked}-${args.disabled}`}
			defaultChecked={args.defaultChecked}
			disabled={args.disabled}
		/>
	),
};

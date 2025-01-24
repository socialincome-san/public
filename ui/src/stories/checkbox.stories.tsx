import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Checkbox } from '../components/checkbox';
import { Label } from '../components/label';

const meta = {
	title: 'Components/Checkbox',
	component: Checkbox,
	tags: ['autodocs'],
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof Checkbox>;

// Basic Checkbox
export const Basic: Story = {
	render: () => <Checkbox />,
};

// With Label
export const WithLabel: Story = {
	render: () => (
		<div className="flex items-center space-x-2">
			<Checkbox id="terms" />
			<Label htmlFor="terms">Accept terms and conditions</Label>
		</div>
	),
};

// Checked State
export const Checked: Story = {
	render: () => <Checkbox defaultChecked />,
};

// Disabled States
export const Disabled: Story = {
	render: () => (
		<div className="flex items-center space-x-4">
			<div className="flex items-center space-x-2">
				<Checkbox disabled />
				<Label className="opacity-50">Unchecked</Label>
			</div>
			<div className="flex items-center space-x-2">
				<Checkbox disabled defaultChecked />
				<Label className="opacity-50">Checked</Label>
			</div>
		</div>
	),
};

// Form Example
export const FormExample: Story = {
	render: () => (
		<form className="space-y-4">
			<div className="flex items-center space-x-2">
				<Checkbox id="newsletter" />
				<Label htmlFor="newsletter">Subscribe to newsletter</Label>
			</div>
			<div className="flex items-center space-x-2">
				<Checkbox id="marketing" />
				<Label htmlFor="marketing">Receive marketing emails</Label>
			</div>
			<div className="flex items-center space-x-2">
				<Checkbox id="updates" />
				<Label htmlFor="updates">Receive product updates</Label>
			</div>
		</form>
	),
};

// Custom Styled
export const CustomStyled: Story = {
	render: () => (
		<div className="space-y-4">
			<div className="flex items-center space-x-2">
				<Checkbox className="border-blue-500 data-[state=checked]:bg-blue-500" />
				<Label>Custom blue checkbox</Label>
			</div>
			<div className="flex items-center space-x-2">
				<Checkbox className="h-6 w-6 border-green-500 data-[state=checked]:bg-green-500" />
				<Label>Large green checkbox</Label>
			</div>
			<div className="flex items-center space-x-2">
				<Checkbox className="rounded-full border-purple-500 data-[state=checked]:bg-purple-500" />
				<Label>Round purple checkbox</Label>
			</div>
		</div>
	),
};

// Interactive Example
export const Interactive: Story = {
	render: () => {
		const [checked, setChecked] = React.useState(false);
		return (
			<div className="flex items-center space-x-2">
				<Checkbox checked={checked} onCheckedChange={(checkedState) => setChecked(Boolean(checkedState))} />
				<Label>{checked ? 'Thanks for checking!' : 'Click me'}</Label>
			</div>
		);
	},
};

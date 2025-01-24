import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from '../components/checkbox';
import { Input } from '../components/input';
import { Label } from '../components/label';
import { Switch } from '../components/switch';

const meta = {
	title: 'Components/Label',
	component: Label,
	tags: ['autodocs'],
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof Label>;

// Basic Label
export const Basic: Story = {
	render: () => <Label>Basic Label</Label>,
};

// With Input
export const WithInput: Story = {
	render: () => (
		<div className="grid w-full max-w-sm items-center gap-1.5">
			<Label htmlFor="email">Email</Label>
			<Input type="email" id="email" placeholder="Enter your email" />
		</div>
	),
};

// With Required Field
export const Required: Story = {
	render: () => (
		<div className="grid w-full max-w-sm items-center gap-1.5">
			<Label htmlFor="username">
				Username <span className="text-destructive">*</span>
			</Label>
			<Input id="username" required />
		</div>
	),
};

// With Checkbox
export const WithCheckbox: Story = {
	render: () => (
		<div className="flex items-center space-x-2">
			<Checkbox id="terms" />
			<Label htmlFor="terms">Accept terms and conditions</Label>
		</div>
	),
};

// With Switch
export const WithSwitch: Story = {
	render: () => (
		<div className="flex items-center space-x-2">
			<Switch id="airplane-mode" />
			<Label htmlFor="airplane-mode">Airplane Mode</Label>
		</div>
	),
};

// Different States
export const States: Story = {
	render: () => (
		<div className="space-y-4">
			<div className="grid w-full max-w-sm items-center gap-1.5">
				<Label htmlFor="normal">Normal Label</Label>
				<Input id="normal" />
			</div>
			<div className="grid w-full max-w-sm items-center gap-1.5">
				<Label htmlFor="disabled" className="opacity-70">
					Disabled Label
				</Label>
				<Input id="disabled" disabled />
			</div>
			<div className="grid w-full max-w-sm items-center gap-1.5">
				<Label htmlFor="error" className="text-destructive">
					Error Label
				</Label>
				<Input id="error" className="border-destructive" />
			</div>
		</div>
	),
};

// Custom Styled
export const CustomStyled: Story = {
	render: () => (
		<div className="space-y-4">
			<div className="grid w-full max-w-sm items-center gap-1.5">
				<Label htmlFor="custom1" className="text-primary font-bold">
					Primary Label
				</Label>
				<Input id="custom1" className="border-primary" />
			</div>
			<div className="grid w-full max-w-sm items-center gap-1.5">
				<Label htmlFor="custom2" className="text-secondary uppercase tracking-wide">
					Styled Label
				</Label>
				<Input id="custom2" className="border-secondary" />
			</div>
		</div>
	),
};

// With Description
export const WithDescription: Story = {
	render: () => (
		<div className="grid w-full max-w-sm gap-1.5">
			<Label htmlFor="picture">Profile Picture</Label>
			<Input id="picture" type="file" />
			<p className="text-muted-foreground text-sm">Accepted formats: .jpg, .png, .gif</p>
		</div>
	),
};

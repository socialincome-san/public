import type { Meta, StoryObj } from '@storybook/react';
import { Separator } from '../components/separator';

const meta = {
	title: 'Components/Separator',
	component: Separator,
	tags: ['autodocs'],
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof Separator>;

// Basic Horizontal Separator
export const BasicHorizontal: Story = {
	render: () => (
		<div className="space-y-4">
			<div>Above</div>
			<Separator />
			<div>Below</div>
		</div>
	),
};

// Vertical Separator
export const Vertical: Story = {
	render: () => (
		<div className="flex h-[100px] items-center">
			<div>Left</div>
			<Separator orientation="vertical" className="mx-4" />
			<div>Right</div>
		</div>
	),
};

// With Content
export const WithContent: Story = {
	render: () => (
		<div className="space-y-4">
			<h4 className="text-sm font-medium leading-none">Section 1</h4>
			<p className="text-muted-foreground text-sm">This is the first section of the content.</p>
			<Separator className="my-4" />
			<h4 className="text-sm font-medium leading-none">Section 2</h4>
			<p className="text-muted-foreground text-sm">This is the second section of the content.</p>
		</div>
	),
};

// Custom Styled
export const CustomStyled: Story = {
	render: () => (
		<div className="space-y-4">
			<Separator className="bg-blue-500" />
			<Separator className="h-[2px] bg-green-500" />
			<Separator className="h-[3px] bg-red-500" />
			<div className="flex h-[100px] items-center">
				<div>Left</div>
				<Separator orientation="vertical" className="mx-4 w-[2px] bg-purple-500" />
				<div>Right</div>
			</div>
		</div>
	),
};

// In Card Layout
export const InCardLayout: Story = {
	render: () => (
		<div className="space-y-4 rounded-lg border p-4">
			<div className="flex items-center justify-between">
				<h3 className="font-semibold">Account Settings</h3>
				<button className="text-sm text-blue-500">Edit</button>
			</div>
			<Separator />
			<div className="space-y-4">
				<div>
					<h4 className="text-sm font-medium">Email</h4>
					<p className="text-muted-foreground text-sm">john@example.com</p>
				</div>
				<Separator />
				<div>
					<h4 className="text-sm font-medium">Password</h4>
					<p className="text-muted-foreground text-sm">Last changed 3 months ago</p>
				</div>
			</div>
		</div>
	),
};

// List Separator
export const ListSeparator: Story = {
	render: () => (
		<div className="w-[200px]">
			<div className="py-2">Item 1</div>
			<Separator />
			<div className="py-2">Item 2</div>
			<Separator />
			<div className="py-2">Item 3</div>
			<Separator />
			<div className="py-2">Item 4</div>
		</div>
	),
};

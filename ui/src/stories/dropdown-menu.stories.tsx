import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Button } from '../components/button';
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from '../components/dropdown-menu';

const meta = {
	title: 'Components/DropdownMenu',
	component: DropdownMenu,
	tags: ['autodocs'],
} satisfies Meta<typeof DropdownMenu>;

export default meta;
type Story = StoryObj<typeof DropdownMenu>;

// Basic Dropdown
export const Basic: Story = {
	render: () => (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button>Open Menu</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuLabel>My Account</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem>Profile</DropdownMenuItem>
				<DropdownMenuItem>Billing</DropdownMenuItem>
				<DropdownMenuItem>Settings</DropdownMenuItem>
				<DropdownMenuItem>Logout</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	),
};

// With Shortcuts
export const WithShortcuts: Story = {
	render: () => (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button>Open Menu</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuItem>
					New Tab <DropdownMenuShortcut>⌘T</DropdownMenuShortcut>
				</DropdownMenuItem>
				<DropdownMenuItem>
					New Window <DropdownMenuShortcut>⌘N</DropdownMenuShortcut>
				</DropdownMenuItem>
				<DropdownMenuItem disabled>
					New Private Window <DropdownMenuShortcut>⇧⌘N</DropdownMenuShortcut>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem>
					Share <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	),
};

// With Submenus
export const WithSubmenus: Story = {
	render: () => (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button>Open Menu</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuItem>Main Action</DropdownMenuItem>
				<DropdownMenuSub>
					<DropdownMenuSubTrigger>More Options</DropdownMenuSubTrigger>
					<DropdownMenuSubContent>
						<DropdownMenuItem>Sub Option 1</DropdownMenuItem>
						<DropdownMenuItem>Sub Option 2</DropdownMenuItem>
						<DropdownMenuSub>
							<DropdownMenuSubTrigger>More Sub Options</DropdownMenuSubTrigger>
							<DropdownMenuSubContent>
								<DropdownMenuItem>Deep Option 1</DropdownMenuItem>
								<DropdownMenuItem>Deep Option 2</DropdownMenuItem>
							</DropdownMenuSubContent>
						</DropdownMenuSub>
					</DropdownMenuSubContent>
				</DropdownMenuSub>
			</DropdownMenuContent>
		</DropdownMenu>
	),
};

// With Checkboxes
export const WithCheckboxes: Story = {
	render: () => {
		const [showStatusBar, setShowStatusBar] = React.useState(true);
		const [showActivityBar, setShowActivityBar] = React.useState(false);

		return (
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button>View Options</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent>
					<DropdownMenuLabel>Appearance</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuCheckboxItem checked={showStatusBar} onCheckedChange={setShowStatusBar}>
						Status Bar
					</DropdownMenuCheckboxItem>
					<DropdownMenuCheckboxItem checked={showActivityBar} onCheckedChange={setShowActivityBar}>
						Activity Bar
					</DropdownMenuCheckboxItem>
				</DropdownMenuContent>
			</DropdownMenu>
		);
	},
};

// With Radio Items
export const WithRadioItems: Story = {
	render: () => {
		const [position, setPosition] = React.useState('bottom');

		return (
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button>Panel Position</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent>
					<DropdownMenuLabel>Panel Position</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuRadioGroup value={position} onValueChange={setPosition}>
						<DropdownMenuRadioItem value="top">Top</DropdownMenuRadioItem>
						<DropdownMenuRadioItem value="bottom">Bottom</DropdownMenuRadioItem>
						<DropdownMenuRadioItem value="right">Right</DropdownMenuRadioItem>
					</DropdownMenuRadioGroup>
				</DropdownMenuContent>
			</DropdownMenu>
		);
	},
};

// With Groups
export const WithGroups: Story = {
	render: () => (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button>Edit</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuGroup>
					<DropdownMenuLabel>Edit</DropdownMenuLabel>
					<DropdownMenuItem>Cut</DropdownMenuItem>
					<DropdownMenuItem>Copy</DropdownMenuItem>
					<DropdownMenuItem>Paste</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuLabel>View</DropdownMenuLabel>
					<DropdownMenuItem>Zoom In</DropdownMenuItem>
					<DropdownMenuItem>Zoom Out</DropdownMenuItem>
					<DropdownMenuItem>Reset Zoom</DropdownMenuItem>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	),
};

import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import {
	Menubar,
	MenubarCheckboxItem,
	MenubarContent,
	MenubarItem,
	MenubarLabel,
	MenubarMenu,
	MenubarRadioGroup,
	MenubarRadioItem,
	MenubarSeparator,
	MenubarShortcut,
	MenubarSub,
	MenubarSubContent,
	MenubarSubTrigger,
	MenubarTrigger,
} from '../components/menubar';

const meta = {
	title: 'Components/Menubar',
	component: Menubar,
	tags: ['autodocs'],
} satisfies Meta<typeof Menubar>;

export default meta;
type Story = StoryObj<typeof Menubar>;

// Basic Menubar
export const Basic: Story = {
	render: () => (
		<Menubar>
			<MenubarMenu>
				<MenubarTrigger>File</MenubarTrigger>
				<MenubarContent>
					<MenubarItem>New Tab</MenubarItem>
					<MenubarItem>New Window</MenubarItem>
					<MenubarSeparator />
					<MenubarItem>Share</MenubarItem>
					<MenubarSeparator />
					<MenubarItem>Print</MenubarItem>
				</MenubarContent>
			</MenubarMenu>
			<MenubarMenu>
				<MenubarTrigger>Edit</MenubarTrigger>
				<MenubarContent>
					<MenubarItem>Undo</MenubarItem>
					<MenubarItem>Redo</MenubarItem>
					<MenubarSeparator />
					<MenubarItem>Cut</MenubarItem>
					<MenubarItem>Copy</MenubarItem>
					<MenubarItem>Paste</MenubarItem>
				</MenubarContent>
			</MenubarMenu>
			<MenubarMenu>
				<MenubarTrigger>View</MenubarTrigger>
				<MenubarContent>
					<MenubarItem>Zoom In</MenubarItem>
					<MenubarItem>Zoom Out</MenubarItem>
					<MenubarSeparator />
					<MenubarItem>Reset View</MenubarItem>
				</MenubarContent>
			</MenubarMenu>
		</Menubar>
	),
};

// With Shortcuts
export const WithShortcuts: Story = {
	render: () => (
		<Menubar>
			<MenubarMenu>
				<MenubarTrigger>File</MenubarTrigger>
				<MenubarContent>
					<MenubarItem>
						New Tab <MenubarShortcut>⌘T</MenubarShortcut>
					</MenubarItem>
					<MenubarItem>
						New Window <MenubarShortcut>⌘N</MenubarShortcut>
					</MenubarItem>
					<MenubarSeparator />
					<MenubarItem>
						Save <MenubarShortcut>⌘S</MenubarShortcut>
					</MenubarItem>
					<MenubarItem disabled>
						Save As... <MenubarShortcut>⇧⌘S</MenubarShortcut>
					</MenubarItem>
				</MenubarContent>
			</MenubarMenu>
		</Menubar>
	),
};

// With Submenus
export const WithSubmenus: Story = {
	render: () => (
		<Menubar>
			<MenubarMenu>
				<MenubarTrigger>Options</MenubarTrigger>
				<MenubarContent>
					<MenubarSub>
						<MenubarSubTrigger>New</MenubarSubTrigger>
						<MenubarSubContent>
							<MenubarItem>Project</MenubarItem>
							<MenubarItem>File</MenubarItem>
							<MenubarItem>Folder</MenubarItem>
						</MenubarSubContent>
					</MenubarSub>
					<MenubarSeparator />
					<MenubarSub>
						<MenubarSubTrigger>Share</MenubarSubTrigger>
						<MenubarSubContent>
							<MenubarItem>Email</MenubarItem>
							<MenubarItem>Message</MenubarItem>
							<MenubarItem>Notes</MenubarItem>
						</MenubarSubContent>
					</MenubarSub>
				</MenubarContent>
			</MenubarMenu>
		</Menubar>
	),
};

// With Checkboxes and Radio Items
export const WithCheckboxesAndRadios: Story = {
	render: () => {
		const [showStatusBar, setShowStatusBar] = React.useState(true);
		const [showPanel, setShowPanel] = React.useState(false);
		const [position, setPosition] = React.useState('bottom');

		return (
			<Menubar>
				<MenubarMenu>
					<MenubarTrigger>View</MenubarTrigger>
					<MenubarContent>
						<MenubarCheckboxItem checked={showStatusBar} onCheckedChange={setShowStatusBar}>
							Status Bar
						</MenubarCheckboxItem>
						<MenubarCheckboxItem checked={showPanel} onCheckedChange={setShowPanel}>
							Panel
						</MenubarCheckboxItem>
						<MenubarSeparator />
						<MenubarLabel>Panel Position</MenubarLabel>
						<MenubarRadioGroup value={position} onValueChange={setPosition}>
							<MenubarRadioItem value="top">Top</MenubarRadioItem>
							<MenubarRadioItem value="bottom">Bottom</MenubarRadioItem>
							<MenubarRadioItem value="right">Right</MenubarRadioItem>
						</MenubarRadioGroup>
					</MenubarContent>
				</MenubarMenu>
			</Menubar>
		);
	},
};

// Custom Styled
export const CustomStyled: Story = {
	render: () => (
		<Menubar className="bg-primary">
			<MenubarMenu>
				<MenubarTrigger className="text-primary-foreground hover:bg-primary-muted">File</MenubarTrigger>
				<MenubarContent className="bg-primary text-primary-foreground">
					<MenubarItem className="hover:bg-primary-muted">New</MenubarItem>
					<MenubarItem className="hover:bg-primary-muted">Open</MenubarItem>
					<MenubarSeparator className="bg-primary-foreground/20" />
					<MenubarItem className="hover:bg-primary-muted">Save</MenubarItem>
				</MenubarContent>
			</MenubarMenu>
		</Menubar>
	),
};

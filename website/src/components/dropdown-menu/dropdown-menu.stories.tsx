import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { MoreHorizontal } from 'lucide-react';

import { Button } from '../button/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from './dropdown-menu';

const meta = {
	title: 'Components/DropdownMenu',
	component: DropdownMenu,
	tags: ['autodocs'],
} satisfies Meta<typeof DropdownMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

const Trigger = () => (
	<DropdownMenuTrigger asChild>
		<Button aria-label="Open menu" size="icon" variant="outline">
			<MoreHorizontal />
		</Button>
	</DropdownMenuTrigger>
);

export const Default: Story = {
	render: () => (
		<DropdownMenu>
			<Trigger />
			<DropdownMenuContent>
				<DropdownMenuItem>Profile</DropdownMenuItem>
				<DropdownMenuItem>Settings</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem>Sign out</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	),
};

export const WithDisabledItem: Story = {
	render: () => (
		<DropdownMenu>
			<Trigger />
			<DropdownMenuContent>
				<DropdownMenuItem>Open</DropdownMenuItem>
				<DropdownMenuItem disabled>Delete</DropdownMenuItem>
				<DropdownMenuItem>Cancel</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	),
};

export const WithSubmenu: Story = {
	render: () => (
		<DropdownMenu>
			<Trigger />
			<DropdownMenuContent>
				<DropdownMenuItem>New tab</DropdownMenuItem>
				<DropdownMenuPrimitive.Sub>
					<DropdownMenuPrimitive.SubTrigger className="flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm">
						Share
					</DropdownMenuPrimitive.SubTrigger>
					<DropdownMenuPrimitive.SubContent className="bg-popover text-popover-foreground min-w-32 rounded-md border p-1 shadow-md">
						<DropdownMenuPrimitive.Item className="focus:bg-accent rounded-sm px-2 py-1.5 text-sm">
							Copy link
						</DropdownMenuPrimitive.Item>
						<DropdownMenuPrimitive.Item className="focus:bg-accent rounded-sm px-2 py-1.5 text-sm">
							Email link
						</DropdownMenuPrimitive.Item>
					</DropdownMenuPrimitive.SubContent>
				</DropdownMenuPrimitive.Sub>
			</DropdownMenuContent>
		</DropdownMenu>
	),
};

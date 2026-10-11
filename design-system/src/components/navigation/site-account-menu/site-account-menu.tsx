'use client';

import { LogOut, type LucideIcon } from 'lucide-react';
import NextLink from 'next/link';
import { Button } from '../../actions/button/button';
import { Avatar, AvatarFallback } from '../../data-display/avatar/avatar';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '../../overlays/dropdown-menu/dropdown-menu';

export type SiteAccountMenuLink = {
	href: string;
	label: string;
	icon: LucideIcon;
};

type SiteAccountMenuProps = {
	firstName?: string | null;
	lastName?: string | null;
	links: SiteAccountMenuLink[];
	signOutLabel: string;
	onSignOut: () => void;
};

export const SiteAccountMenu = ({ firstName, lastName, links, signOutLabel, onSignOut }: SiteAccountMenuProps) => (
	<DropdownMenu>
		<DropdownMenuTrigger asChild>
			<Button variant="outline" size="md">
				<Avatar size="sm">
					<AvatarFallback>
						{firstName?.[0]}
						{lastName?.[0]}
					</AvatarFallback>
				</Avatar>

				<span className="text-sm font-medium">
					{firstName} {lastName}
				</span>
			</Button>
		</DropdownMenuTrigger>

		<DropdownMenuContent align="end">
			{links.map(({ href, label, icon: Icon }) => (
				<DropdownMenuItem key={href} asChild>
					<NextLink href={href} className="flex items-center gap-2">
						<Icon className="h-4 w-4" />
						<span>{label}</span>
					</NextLink>
				</DropdownMenuItem>
			))}

			<DropdownMenuSeparator />

			<DropdownMenuItem
				onSelect={(event: Event) => {
					event.preventDefault();
					onSignOut();
				}}
				variant="destructive"
			>
				<LogOut className="mr-2 h-4 w-4" />
				<span>{signOutLabel}</span>
			</DropdownMenuItem>
		</DropdownMenuContent>
	</DropdownMenu>
);

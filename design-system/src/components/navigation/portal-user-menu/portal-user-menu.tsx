'use client';

import { cva } from 'class-variance-authority';
import { ChevronsUpDown, LogOut, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback } from '../../data-display/avatar/avatar';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '../../overlays/dropdown-menu/dropdown-menu';

export type PortalUserMenuVariant = 'bar' | 'menu';

export type PortalUserMenuLink = {
	href: string;
	label: string;
	icon?: LucideIcon;
};

export type PortalUserMenuProps = {
	variant: PortalUserMenuVariant;
	name: string;
	initials: string;
	subtitle: string;
	links: PortalUserMenuLink[];
	signOutLabel: string;
	onSignOut: () => void;
	align?: 'start' | 'center' | 'end';
	onNavigate?: () => void;
};

const triggerVariants = cva(
	'border-input bg-background text-primary hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring flex items-center border text-left transition-colors focus-visible:ring-1 focus-visible:outline-hidden',
	{
		variants: {
			variant: {
				bar: 'h-12 gap-2 rounded-full px-3',
				menu: 'w-full gap-3 rounded-xl p-3',
			},
		},
	},
);

export const PortalUserMenu = ({
	variant,
	name,
	initials,
	subtitle,
	links,
	signOutLabel,
	onSignOut,
	align = 'end',
	onNavigate,
}: PortalUserMenuProps) => (
	<DropdownMenu>
		<DropdownMenuTrigger asChild>
			<button type="button" className={triggerVariants({ variant })}>
				<Avatar>
					<AvatarFallback>{initials}</AvatarFallback>
				</Avatar>
				<div className="min-w-0 flex-1 text-left">
					<p className="truncate text-sm font-medium">{name}</p>
					<p className="text-muted-foreground truncate text-xs">{subtitle}</p>
				</div>
				<ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
			</button>
		</DropdownMenuTrigger>

		<DropdownMenuContent align={align}>
			{links.map(({ href, label, icon: Icon }) => (
				<DropdownMenuItem asChild key={href}>
					<Link href={href} onClick={onNavigate} className="flex items-center gap-2">
						{Icon && <Icon className="h-4 w-4" />}
						<span>{label}</span>
					</Link>
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

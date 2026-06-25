'use client';

import { useNavbarLinks } from '@/components/app-shells/portal/navbar/hooks/use-navbar-links';
import { useLogout } from '@/components/app-shells/use-logout';
import { Avatar, AvatarFallback } from '@/components/avatar';
import { Button } from '@/components/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/dropdown-menu';
import type { Session } from '@/lib/firebase/current-account';
import type { UserSession } from '@/lib/services/user/user.types';
import { cn } from '@/lib/utils/cn';
import { ChevronsUpDown, LogOut } from 'lucide-react';
import Link from 'next/link';

type DropdownAlign = 'start' | 'center' | 'end';

type UserMenuProps = {
	sessions: Session[];
	align?: DropdownAlign;
	triggerClassName?: string;
	onNavigate?: () => void;
};

export const UserMenu = ({ sessions, align = 'end', triggerClassName, onNavigate }: UserMenuProps) => {
	const user = sessions.find((s): s is UserSession => s.type === 'user');
	const { userMenuNavLinks } = useNavbarLinks(sessions);
	const { logout } = useLogout();

	if (!user) {
		return null;
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" className={cn('flex items-center gap-2 rounded-full px-3', triggerClassName)}>
					<Avatar>
						<AvatarFallback className="bg-primary text-background">
							{user.firstName?.[0]}
							{user.lastName?.[0]}
						</AvatarFallback>
					</Avatar>
					<div className="min-w-0 flex-1 text-left">
						<p className="truncate text-sm font-medium">
							{user.firstName} {user.lastName}
						</p>
						<p className="text-muted-foreground truncate text-xs">
							{user.activeOrganization?.name ?? 'No active organization'}
						</p>
					</div>
					<ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent align={align} className="w-64">
				{userMenuNavLinks.map(({ href, label, icon: Icon }) => (
					<DropdownMenuItem asChild key={href}>
						<Link href={href} onClick={onNavigate} className="flex items-center gap-2">
							{Icon && <Icon className="h-4 w-4" />}
							<span>{label}</span>
						</Link>
					</DropdownMenuItem>
				))}

				<DropdownMenuSeparator />

				<DropdownMenuItem
					onSelect={(e: Event) => {
						e.preventDefault();
						void logout();
					}}
					className="text-destructive focus:text-destructive"
				>
					<LogOut className="mr-2 h-4 w-4" />
					<span>Sign out</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

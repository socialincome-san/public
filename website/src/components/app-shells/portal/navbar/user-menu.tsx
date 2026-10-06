'use client';

import { useNavbarLinks } from '@/components/app-shells/portal/navbar/hooks/use-navbar-links';
import { useLogout } from '@/components/app-shells/use-logout';
import type { Session } from '@/modules/auth/auth.types';
import type { UserSession } from '@/modules/users/user.types';
import { cn } from '@socialincome/design-system/cn';
import { Avatar, AvatarFallback } from '@socialincome/design-system/data-display/avatar/avatar';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@socialincome/design-system/overlays/dropdown-menu/dropdown-menu';
import { ChevronsUpDown, LogOut } from 'lucide-react';
import Link from 'next/link';

type DropdownAlign = 'start' | 'center' | 'end';

type UserMenuProps = {
	sessions: Session[];
	align?: DropdownAlign;
	variant: 'bar' | 'menu';
	onNavigate?: () => void;
};

export const UserMenu = ({ sessions, align = 'end', variant, onNavigate }: UserMenuProps) => {
	const user = sessions.find((s): s is UserSession => s.type === 'user');
	const { userMenuNavLinks } = useNavbarLinks(sessions);
	const { logout } = useLogout();

	if (!user) {
		return null;
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					type="button"
					className={cn(
						'border-input bg-background text-primary hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring flex items-center border text-left transition-colors focus-visible:ring-1 focus-visible:outline-hidden',
						variant === 'bar' ? 'h-12 gap-2 rounded-full px-3' : 'w-full gap-3 rounded-xl p-3',
					)}
				>
					<Avatar>
						<AvatarFallback>
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
				</button>
			</DropdownMenuTrigger>

			<DropdownMenuContent align={align}>
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
					variant="destructive"
				>
					<LogOut className="mr-2 h-4 w-4" />
					<span>Sign out</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

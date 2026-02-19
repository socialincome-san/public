'use client';

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
import { Session } from '@/lib/firebase/current-account';
import { NEW_WEBSITE_SLUG } from '@/lib/utils/const';
import { LogOut, User } from 'lucide-react';
import Link from 'next/link';
export type Scope = 'website' | 'dashboard' | 'partner-space';

type Props = {
  session: Session;
  scope: Scope;
};

export const AccountMenu = ({ session, scope }: Props) => {
  const { logout } = useLogout();

  let linkInDropdown: { href: string; label: string };

  switch (scope) {
    case 'website':
      linkInDropdown = {
        href: `/${NEW_WEBSITE_SLUG}/auth/my-account`,
        label: 'My Account',
      };
      break;

    case 'partner-space':
      linkInDropdown = {
        href: '/partner-space/profile',
        label: 'Profile',
      };
      break;

    case 'dashboard':
    default:
      linkInDropdown = {
        href: '/dashboard/profile',
        label: 'Profile',
      };
      break;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex h-10 items-center gap-2 rounded-full px-3">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="text-sm">
              {session.firstName?.[0]}
              {session.lastName?.[0]}
            </AvatarFallback>
          </Avatar>

          <span className="text-sm font-medium">
            {session.firstName} {session.lastName}
          </span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuItem asChild>
          <Link href={linkInDropdown.href} className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>{linkInDropdown.label}</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onSelect={(e: Event) => {
            e.preventDefault();
            logout();
          }}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

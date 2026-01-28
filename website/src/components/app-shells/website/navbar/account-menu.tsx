'use client';

import { Avatar, AvatarFallback } from '@/components/avatar';
import { Button } from '@/components/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/dropdown-menu';
import { ContributorSession } from '@/lib/services/contributor/contributor.types';
import { LocalPartnerSession } from '@/lib/services/local-partner/local-partner.types';
import Link from 'next/link';

type Props = {
	session: ContributorSession | LocalPartnerSession;
};

export const AccountMenu = ({ session }: Props) => {
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
					<Link href="/profile">Profile</Link>
				</DropdownMenuItem>
				<DropdownMenuItem onSelect={() => {}}>Logout</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

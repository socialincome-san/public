'use client';

import { CreateProgramModal } from '@/components/create-program-wizard/create-program-modal';
import type { Session } from '@/modules/auth/auth.types';
import type { UserSession } from '@/modules/users/user.types';
import { cn } from '@socialincome/design-system/cn';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@socialincome/design-system/overlays/dropdown-menu/dropdown-menu';
import { ChevronDown, Wallet } from 'lucide-react';
import Link from 'next/link';
import { FC } from 'react';

type ProgramDropdownProps = {
	sessions: Session[];
	active?: boolean;
	/** Matches the surrounding links: the desktop navigation bar or the stacked mobile menu */
	variant: 'bar' | 'menu';
};

export const ProgramDropdown: FC<ProgramDropdownProps> = ({ sessions, active = false, variant }) => {
	const user = sessions.find((s): s is UserSession => s.type === 'user');
	if (!user) {
		return null;
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					type="button"
					className={cn(
						'text-primary hover:bg-accent relative flex items-center gap-1 rounded-md px-3 py-2 font-medium transition-colors duration-200',
						variant === 'bar' ? 'text-lg' : 'w-full text-base',
						variant === 'menu' && active && 'bg-accent',
					)}
				>
					{variant === 'bar' && active && <span className="bg-primary absolute -bottom-1 left-0 h-1 w-full rounded-t-lg" />}
					<span>Programs</span>
					<ChevronDown className="h-4 w-4 opacity-70" />
				</button>
			</DropdownMenuTrigger>

			<DropdownMenuContent align="start">
				{user.programs?.length ? (
					user.programs.map((program) => (
						<DropdownMenuItem asChild key={program.id}>
							<Link href={`/portal/programs/${program.id}/overview`}>{program.name}</Link>
						</DropdownMenuItem>
					))
				) : (
					<DropdownMenuItem disabled>No programs</DropdownMenuItem>
				)}

				<DropdownMenuSeparator />

				<DropdownMenuItem asChild>
					<CreateProgramModal
						isAuthenticated
						trigger={
							<p className="hover:bg-accent flex cursor-pointer items-center gap-2 rounded-md p-2 text-sm font-medium transition-colors duration-200">
								<Wallet className="h-4 w-4" />
								Create new program
							</p>
						}
					/>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

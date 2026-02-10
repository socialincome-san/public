'use client';

import { Button } from '@/components/button';
import { CreateProgramModal } from '@/components/create-program-wizard/create-program-modal';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/dropdown-menu';
import type { UserSession } from '@/lib/services/user/user.types';
import { ChevronDown, Wallet } from 'lucide-react';
import Link from 'next/link';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

type ProgramDropdownProps = {
	user: UserSession;
	active?: boolean;
	className?: string;
};

export const ProgramDropdown: FC<ProgramDropdownProps> = ({ user, active = false, className }) => (
	<DropdownMenu>
		<DropdownMenuTrigger asChild>
			<Button
				variant="ghost"
				className={twMerge(
					'text-primary hover:bg-accent relative rounded-md px-3 py-2 text-lg font-medium transition-colors duration-200',
					className,
				)}
			>
				{active && <span className="bg-primary absolute -bottom-1 left-0 h-1 w-full rounded-t-lg" />}
				<span>Programs</span>
				<ChevronDown className="ml-1 h-4 w-4 opacity-70" />
			</Button>
		</DropdownMenuTrigger>

		<DropdownMenuContent align="start" className="w-56">
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

'use client';

import { cva } from 'class-variance-authority';
import { ChevronDown, Wallet } from 'lucide-react';
import Link from 'next/link';
import { type ReactElement, type ReactNode } from 'react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '../../overlays/dropdown-menu/dropdown-menu';

export type PortalProgramMenuVariant = 'bar' | 'menu';

export type PortalProgramMenuProgram = {
	href: string;
	label: string;
};

export type PortalProgramMenuProps = {
	variant: PortalProgramMenuVariant;
	label: string;
	programs: PortalProgramMenuProgram[];
	emptyLabel: string;
	createProgramLabel: string;
	// Lets the app wrap the styled trigger in its own create-program dialog
	renderCreateProgram: (trigger: ReactNode) => ReactElement;
	active?: boolean;
};

const triggerVariants = cva(
	'text-primary hover:bg-accent relative flex items-center gap-1 rounded-md px-3 py-2 font-medium transition-colors duration-200',
	{
		variants: {
			variant: {
				bar: 'text-lg',
				menu: 'w-full text-base',
			},
			highlighted: {
				true: 'bg-accent',
				false: '',
			},
		},
	},
);

export const PortalProgramMenu = ({
	variant,
	label,
	programs,
	emptyLabel,
	createProgramLabel,
	renderCreateProgram,
	active = false,
}: PortalProgramMenuProps) => (
	<DropdownMenu>
		<DropdownMenuTrigger asChild>
			<button type="button" className={triggerVariants({ variant, highlighted: variant === 'menu' && active })}>
				{variant === 'bar' && active && <span className="bg-primary absolute -bottom-1 left-0 h-1 w-full rounded-t-lg" />}
				<span>{label}</span>
				<ChevronDown className="h-4 w-4 opacity-70" />
			</button>
		</DropdownMenuTrigger>

		<DropdownMenuContent align="start">
			{programs.length ? (
				programs.map((program) => (
					<DropdownMenuItem asChild key={program.href}>
						<Link href={program.href}>{program.label}</Link>
					</DropdownMenuItem>
				))
			) : (
				<DropdownMenuItem disabled>{emptyLabel}</DropdownMenuItem>
			)}

			<DropdownMenuSeparator />

			<DropdownMenuItem asChild>
				{renderCreateProgram(
					<p className="hover:bg-accent flex cursor-pointer items-center gap-2 rounded-md p-2 text-sm font-medium transition-colors duration-200">
						<Wallet className="h-4 w-4" />
						{createProgramLabel}
					</p>,
				)}
			</DropdownMenuItem>
		</DropdownMenuContent>
	</DropdownMenu>
);

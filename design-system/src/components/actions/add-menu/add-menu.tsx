'use client';

import { Plus } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '../../overlays/dropdown-menu/dropdown-menu';
import { Button } from '../button/button';

type AddMenuProps = {
	label: string;
	disabled?: boolean;
	children: ReactNode;
};

export const AddMenu = ({ label, disabled, children }: AddMenuProps) => {
	const [open, setOpen] = useState(false);

	return (
		<DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
			<DropdownMenuTrigger asChild>
				<Button type="button" variant="ghost" size="icon-lg" aria-label={label} disabled={disabled}>
					<Plus
						aria-hidden="true"
						className={`scale-130 transition-transform duration-200 ease-out motion-reduce:transition-none ${open ? 'rotate-45' : 'rotate-0'}`}
					/>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent side="top" align="start" sideOffset={8}>
				{children}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

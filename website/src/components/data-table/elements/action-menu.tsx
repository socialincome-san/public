'use client';

import { Button } from '@/components/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/dropdown-menu';
import { MoreHorizontalIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export type ActionMenuItem = {
	label: string;
	icon: ReactNode;
	onSelect?: () => void;
	href?: string;
	disabled?: boolean;
};

type ActionMenuProps = {
	items?: ActionMenuItem[];
};

export const ActionMenu = ({ items = [] }: ActionMenuProps) => {
	if (items.length === 0) {
		return null;
	}

	const runAction = (item: ActionMenuItem) => {
		if (item.onSelect) {
			item.onSelect();
			return;
		}
		if (item.href) {
			window.location.assign(item.href);
		}
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button type="button" variant="outline" size="icon" aria-label="Table actions">
					<MoreHorizontalIcon />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-56">
				{items.map((item, index) => (
					<DropdownMenuItem
						key={`${item.label}-${index}`}
						disabled={item.disabled}
						onSelect={(event) => {
							event.preventDefault();
							runAction(item);
						}}
					>
						{item.icon}
						<span>{item.label}</span>
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

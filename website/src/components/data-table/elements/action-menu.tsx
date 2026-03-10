'use client';

import { Button } from '@/components/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/dropdown-menu';
import { MoreHorizontalIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
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

const toTestIdSlug = (label: string): string =>
	label
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');

export const ActionMenu = ({ items = [] }: ActionMenuProps) => {
	const router = useRouter();

	if (items.length === 0) {
		return null;
	}

	const runAction = (item: ActionMenuItem) => {
		if (item.onSelect) {
			item.onSelect();
			return;
		}
		if (item.href) {
			router.push(item.href);
		}
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					type="button"
					variant="outline"
					size="icon"
					aria-label="Table actions"
					data-testid="data-table-actions-button"
				>
					<MoreHorizontalIcon />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-56" data-testid="data-table-actions-menu">
				{items.map((item, index) => (
					<DropdownMenuItem
						key={`${item.label}-${index}`}
						disabled={item.disabled}
						data-testid={`data-table-action-item-${toTestIdSlug(item.label)}`}
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

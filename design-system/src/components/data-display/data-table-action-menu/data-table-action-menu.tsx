'use client';

import { MoreHorizontalIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '../../actions/button/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '../../overlays/dropdown-menu/dropdown-menu';

export type DataTableActionMenuItem = {
	label: string;
	icon?: ReactNode;
	disabled?: boolean;
	onSelect: () => void;
};

type DataTableActionMenuProps = {
	items: DataTableActionMenuItem[];
};

const toTestIdSlug = (label: string) =>
	label
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');

export const DataTableActionMenu = ({ items }: DataTableActionMenuProps) => {
	if (items.length === 0) {
		return null;
	}

	if (items.length === 1) {
		const [item] = items;

		return (
			<Button
				type="button"
				variant="default"
				onClick={(event) => {
					event.preventDefault();
					item.onSelect();
				}}
				disabled={item.disabled}
				data-testid={`data-table-action-item-${toTestIdSlug(item.label)}`}
				aria-label={item.label}
			>
				{item.icon}
				<span>{item.label}</span>
			</Button>
		);
	}

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
			<DropdownMenuContent align="end" data-testid="data-table-actions-menu">
				{items.map((item, index) => (
					<DropdownMenuItem
						key={`${item.label}-${index}`}
						disabled={item.disabled}
						data-testid={`data-table-action-item-${toTestIdSlug(item.label)}`}
						onSelect={(event) => {
							event.preventDefault();
							item.onSelect();
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

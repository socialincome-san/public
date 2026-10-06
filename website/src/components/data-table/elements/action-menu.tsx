'use client';

import { DataTableActionMenu } from '@socialincome/design-system/data-display/data-table-action-menu/data-table-action-menu';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

export type ActionMenuItem = {
	label: string;
	icon?: ReactNode;
	onSelect?: () => void;
	href?: string;
	disabled?: boolean;
};

type ActionMenuProps = {
	items?: ActionMenuItem[];
};

export const ActionMenu = ({ items = [] }: ActionMenuProps) => {
	const router = useRouter();

	return (
		<DataTableActionMenu
			items={items.map(({ label, icon, disabled, onSelect, href }) => ({
				label,
				icon,
				disabled,
				onSelect: () => {
					if (onSelect) {
						onSelect();

						return;
					}
					if (href) {
						router.push(href);
					}
				},
			}))}
		/>
	);
};

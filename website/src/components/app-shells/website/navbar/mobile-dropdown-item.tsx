'use client';

import type { DropdownItem } from '@/generated/storyblok/types/109655/storyblok-components';
import { ChevronRight } from 'lucide-react';
import { FC } from 'react';

type Props = {
	item: DropdownItem;
	onSelect: (item: DropdownItem) => void;
};

export const MobileDropdownItem: FC<Props> = ({ item, onSelect }) => {
	const hasChildren = item.menuItemGroups.some((g) => (g.items?.length ?? 0) > 0);

	if (!hasChildren) {
		return null;
	}

	return (
		<li className="border-border border-b">
			<button
				className="flex w-full items-center justify-between py-5 text-lg font-semibold"
				onClick={() => onSelect(item)}
			>
				{item.label}
				<ChevronRight className="size-5 shrink-0" />
			</button>
		</li>
	);
};

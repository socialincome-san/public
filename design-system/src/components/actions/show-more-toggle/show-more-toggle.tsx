'use client';

import { cva } from 'class-variance-authority';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { Button } from '../button/button';

const itemsVariants = cva('', {
	variants: {
		layout: {
			list: '',
			grid: 'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3',
		},
	},
});

type Props = {
	children: ReactNode[];
	initialCount?: number;
	showMoreLabel: string;
	showLessLabel: string;
	layout?: 'list' | 'grid';
};

export const ShowMoreToggle = ({ children, initialCount = 3, showMoreLabel, showLessLabel, layout = 'list' }: Props) => {
	const [expanded, setExpanded] = useState(false);
	const visibleItems = expanded ? children : children.slice(0, initialCount);

	return (
		<div>
			<div className={itemsVariants({ layout })}>{visibleItems}</div>
			{children.length > initialCount && (
				<div className="mt-6">
					<Button type="button" variant="link" size="inline" onClick={() => setExpanded((value) => !value)}>
						{expanded ? showLessLabel : showMoreLabel}
					</Button>
				</div>
			)}
		</div>
	);
};

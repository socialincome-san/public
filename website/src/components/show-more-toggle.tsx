'use client';

import { Button } from '@/components/button';
import type { ReactNode } from 'react';
import { useState } from 'react';

type Props = {
	children: ReactNode[];
	initialCount?: number;
	showMoreLabel: string;
	showLessLabel: string;
};

export const ShowMoreToggle = ({ children, initialCount = 3, showMoreLabel, showLessLabel }: Props) => {
	const [expanded, setExpanded] = useState(false);
	const visibleItems = expanded ? children : children.slice(0, initialCount);

	return (
		<div>
			{visibleItems}
			{children.length > initialCount && (
				<Button
					type="button"
					variant="link"
					className="mt-4 h-auto p-0 text-sm"
					onClick={() => setExpanded((value) => !value)}
				>
					{expanded ? showLessLabel : showMoreLabel}
				</Button>
			)}
		</div>
	);
};

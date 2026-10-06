'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';
import { Button } from '../button/button';

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
				<div className="mt-6">
					<Button type="button" variant="link" size="inline" onClick={() => setExpanded((value) => !value)}>
						{expanded ? showLessLabel : showMoreLabel}
					</Button>
				</div>
			)}
		</div>
	);
};

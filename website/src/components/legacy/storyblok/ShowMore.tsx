'use client';

import { ReactNode, useState } from 'react';

type ShowMoreToggleProps = {
	children: ReactNode[];
	initialCount?: number;
	showMoreLabel?: string;
	showLessLabel?: string;
};

export const ShowMoreToggle = ({ children, initialCount = 3, showMoreLabel, showLessLabel }: ShowMoreToggleProps) => {
	const [expanded, setExpanded] = useState(false);

	const showMore = showMoreLabel ?? 'Show more';
	const showLess = showLessLabel ?? 'Show less';

	const visibleItems = expanded ? children : children.slice(0, initialCount);

	return (
		<div>
			{visibleItems}
			{children.length > initialCount && (
				<button className="text-primary mt-4 text-sm underline" onClick={() => setExpanded(!expanded)}>
					{expanded ? showLess : showMore}
				</button>
			)}
		</div>
	);
};

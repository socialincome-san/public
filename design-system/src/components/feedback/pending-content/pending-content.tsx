import type { ReactNode } from 'react';

type Props = {
	pending: boolean;
	children: ReactNode;
};

// `display: contents` adds no box, so the layout is the same either way; `visibility` still inherits.
export const PendingContent = ({ pending, children }: Props) => (
	<div className={pending ? 'invisible contents' : 'contents'} aria-busy={pending}>
		{children}
	</div>
);

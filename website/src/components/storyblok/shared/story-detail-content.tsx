import type { PropsWithChildren } from 'react';

export const StoryDetailContent = ({ children }: PropsWithChildren) => (
	<div className="w-site-width max-w-content mx-auto">{children}</div>
);

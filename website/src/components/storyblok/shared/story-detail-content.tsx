import type { PropsWithChildren } from 'react';

export const StoryDetailContent = ({ children }: PropsWithChildren) => (
	<div className="max-w-content 2xl:w-site-width ml-[2vw] pl-8 2xl:mx-auto">{children}</div>
);

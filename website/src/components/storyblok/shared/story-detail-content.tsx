import type { PropsWithChildren } from 'react';

export const StoryDetailContent = ({ children }: PropsWithChildren) => (
	<div className="w-full max-w-content px-4 md:px-6 lg:px-0 lg:ml-[2vw] lg:pl-8 2xl:w-site-width 2xl:mx-auto">{children}</div>
);

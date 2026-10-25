import type { PropsWithChildren } from 'react';

export const JournalPageShell = ({ children }: PropsWithChildren) => (
	<div className="w-site-width max-w-content mx-auto space-y-10 py-6 sm:py-10">{children}</div>
);

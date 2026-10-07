import { type ReactNode } from 'react';

type StatGridProps = {
	children: ReactNode;
};

export const StatGrid = ({ children }: StatGridProps) => (
	<div className="mt-auto grid grid-cols-2 gap-4 py-4 text-sm">{children}</div>
);

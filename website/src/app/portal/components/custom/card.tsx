import { ReactNode } from 'react';

export function Card({ children }: { children: ReactNode }) {
	return <div className="bg-background rounded-3xl p-10 shadow-lg">{children}</div>;
}

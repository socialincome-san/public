import { ReactNode } from 'react';

type CardProps = {
	children: ReactNode;
};

export function Card({ children }: CardProps) {
	return <div className="bg-background rounded-3xl p-10 shadow-lg">{children}</div>;
}

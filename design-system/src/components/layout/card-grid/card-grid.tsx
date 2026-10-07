import { Children, type ReactNode } from 'react';

type CardGridProps = {
	children: ReactNode;
	// Shown instead of the grid when there are no cards
	emptyMessage: string;
};

export const CardGrid = ({ children, emptyMessage }: CardGridProps) =>
	Children.count(children) === 0 ? (
		<p className="text-muted-foreground">{emptyMessage}</p>
	) : (
		<ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">{children}</ul>
	);

// Stretches its card to the height of the tallest card in the row
export const CardGridItem = ({ children }: { children: ReactNode }) => <li className="flex h-full *:w-full">{children}</li>;

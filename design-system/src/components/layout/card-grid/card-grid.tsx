import { cva } from 'class-variance-authority';
import { Children, type ReactNode } from 'react';

const gridVariants = cva('grid grid-cols-1 gap-6', {
	variants: {
		columns: {
			auto: 'sm:grid-cols-2 lg:grid-cols-3',
			// A fixed set of three, e.g. choices side by side, that only stacks on phones
			three: 'sm:grid-cols-3',
		},
	},
});

type CardGridProps = {
	children: ReactNode;
	// Shown instead of the grid when there are no cards
	emptyMessage: string;
	columns?: 'auto' | 'three';
};

export const CardGrid = ({ children, emptyMessage, columns = 'auto' }: CardGridProps) =>
	Children.count(children) === 0 ? (
		<p className="text-muted-foreground">{emptyMessage}</p>
	) : (
		<ul className={gridVariants({ columns })}>{children}</ul>
	);

// Stretches its card to the height of the tallest card in the row
export const CardGridItem = ({ children }: { children: ReactNode }) => <li className="flex h-full *:w-full">{children}</li>;

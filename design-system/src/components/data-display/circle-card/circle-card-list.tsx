import { type ReactNode } from 'react';

type CircleCardListProps<T> = {
	items: readonly T[];
	getKey: (item: T) => string;
	// Usually a CircleCard
	renderItem: (item: T) => ReactNode;
	// Shown instead of the list when there are no items
	emptyMessage: string;
};

// No 'use client', so server components can pass getKey and renderItem.
// A list of rows on small screens, a grid of tiles (three across at full width) from md up
export const CircleCardList = <T,>({ items, getKey, renderItem, emptyMessage }: CircleCardListProps<T>) =>
	items.length === 0 ? (
		<p className="text-muted-foreground">{emptyMessage}</p>
	) : (
		<ul className="grid grid-cols-1 gap-3 md:grid-cols-[repeat(auto-fill,minmax(min(20rem,100%),1fr))] md:gap-6">
			{items.map((item) => (
				<li key={getKey(item)} className="flex *:w-full">
					{renderItem(item)}
				</li>
			))}
		</ul>
	);

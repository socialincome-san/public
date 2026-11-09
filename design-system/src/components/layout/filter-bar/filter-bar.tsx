import type { ReactNode } from 'react';
import { cn } from '../../../cn';

type FilterBarProps = {
	filters: ReactNode;
	/** Optional, e.g. left out for short lists */
	search?: ReactNode;
	/**
	 * Short text such as the number of results, left of the search; while the search sits below the filters it is
	 * hidden, so the search can carry it (see SearchInput's compactPlaceholder). Without a search it always shows.
	 */
	summary?: ReactNode;
};

// From @3xl everything stays in one line: the filters keep their full labels and the search shrinks to make room
// Without a search, a bar whose filters all render nothing (e.g. single-option dropdowns) has nothing to offer: it hides,
// count included
export const FilterBar = ({ filters, search, summary }: FilterBarProps) => (
	<div className={cn('@container/filter-bar', !search && 'has-[[data-slot=filter-bar-filters]:empty]:hidden')}>
		<div className="flex flex-wrap items-center justify-between gap-2 @3xl/filter-bar:flex-nowrap @3xl/filter-bar:gap-4">
			<div
				data-slot="filter-bar-filters"
				className={cn(
					'flex min-h-10 min-w-0 flex-wrap items-center gap-2 empty:hidden @3xl/filter-bar:shrink-0 @3xl/filter-bar:flex-nowrap',
					search ? 'w-full @3xl/filter-bar:w-auto' : 'w-auto',
				)}
			>
				{filters}
			</div>
			{summary ? (
				<p
					className={cn(
						'text-muted-foreground shrink-0 text-sm whitespace-nowrap',
						search ? 'hidden @3xl/filter-bar:ml-auto @3xl/filter-bar:block' : 'ml-auto',
					)}
				>
					{summary}
				</p>
			) : null}
			{search ? <div className="w-full min-w-0 @3xl/filter-bar:w-80 @3xl/filter-bar:min-w-24">{search}</div> : null}
		</div>
	</div>
);

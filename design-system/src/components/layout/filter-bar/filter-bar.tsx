import type { ReactNode } from 'react';

type FilterBarProps = {
	filters: ReactNode;
	search: ReactNode;
	/** Short text left of the search, such as the number of results */
	summary?: ReactNode;
};

export const FilterBar = ({ filters, search, summary }: FilterBarProps) => (
	<div className="@container/filter-bar">
		<div className="flex flex-wrap items-center justify-between gap-4 @2xl/filter-bar:flex-nowrap">
			<div className="flex min-h-10 w-full min-w-0 items-center gap-2 @2xl/filter-bar:w-auto">{filters}</div>
			<div className="flex w-full min-w-0 items-center gap-4 @2xl/filter-bar:w-auto">
				{summary ? <p className="text-muted-foreground shrink-0 text-sm whitespace-nowrap">{summary}</p> : null}
				<div className="w-full min-w-0 @2xl/filter-bar:w-64 @3xl/filter-bar:w-80">{search}</div>
			</div>
		</div>
	</div>
);

import type { ReactNode } from 'react';

type FilterBarProps = {
	filters: ReactNode;
	search: ReactNode;
	/** Short text such as the number of results: left of the search, or inside it at the right once the bar wraps */
	summary?: ReactNode;
};

export const FilterBar = ({ filters, search, summary }: FilterBarProps) => (
	<div className="@container/filter-bar">
		<div className="flex flex-wrap items-center justify-between gap-4 @2xl/filter-bar:flex-nowrap">
			<div className="flex min-h-10 w-full min-w-0 items-center gap-2 @2xl/filter-bar:w-auto">{filters}</div>
			<div className="flex w-full min-w-0 items-center gap-4 @2xl/filter-bar:w-auto">
				{summary ? (
					<p className="text-muted-foreground hidden shrink-0 text-sm whitespace-nowrap @2xl/filter-bar:block">{summary}</p>
				) : null}
				<div
					className={
						summary
							? 'relative w-full min-w-0 @2xl/filter-bar:w-64 @3xl/filter-bar:w-80 @max-2xl/filter-bar:[&_input]:pr-28'
							: 'w-full min-w-0 @2xl/filter-bar:w-64 @3xl/filter-bar:w-80'
					}
				>
					{search}
					{summary ? (
						<p className="text-muted-foreground pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-sm whitespace-nowrap @2xl/filter-bar:hidden">
							{summary}
						</p>
					) : null}
				</div>
			</div>
		</div>
	</div>
);

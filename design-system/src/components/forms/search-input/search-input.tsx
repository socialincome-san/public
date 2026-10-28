import { SearchIcon } from 'lucide-react';
import * as React from 'react';
import { cn } from '../../../cn';
import { type WithoutClassName } from '../../../without-class-name';
import { inputVariants } from '../input/input';

type SearchInputProps = WithoutClassName<Omit<React.ComponentProps<'input'>, 'type' | 'placeholder'>> & {
	placeholder?: string;
	/** Replaces the placeholder while a surrounding FilterBar shows the search below its filters, e.g. "Search 18 programs" */
	compactPlaceholder?: string;
};

export const SearchInput = ({ placeholder, compactPlaceholder, ...props }: SearchInputProps) => (
	<div className="relative w-full">
		<SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
		{/* A native placeholder can't follow a container query, so the switching one is drawn on top; " " keeps
		    :placeholder-shown working to hide it once there's a value */}
		<input
			type="search"
			data-slot="input"
			className={cn(inputVariants(), 'peer pl-9')}
			placeholder={compactPlaceholder ? ' ' : placeholder}
			{...props}
		/>
		{compactPlaceholder ? (
			<span
				aria-hidden
				className="text-muted-foreground pointer-events-none absolute inset-y-0 right-3 left-9 flex items-center text-sm peer-[:not(:placeholder-shown)]:hidden"
			>
				<span className="truncate @3xl/filter-bar:hidden">{compactPlaceholder}</span>
				<span className="hidden truncate @3xl/filter-bar:inline">{placeholder}</span>
			</span>
		) : null}
	</div>
);

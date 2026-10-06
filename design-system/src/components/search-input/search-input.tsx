import { SearchIcon } from 'lucide-react';
import * as React from 'react';
import { cn } from '../../cn';
import { type WithoutClassName } from '../../without-class-name';
import { inputVariants } from '../input/input';

export const SearchInput = (props: WithoutClassName<Omit<React.ComponentProps<'input'>, 'type'>>) => (
	<div className="relative w-full">
		<SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
		<input type="search" data-slot="input" className={cn(inputVariants(), 'pl-9')} {...props} />
	</div>
);

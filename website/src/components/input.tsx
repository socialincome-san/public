import * as React from 'react';

import { cn } from '@/lib/utils/cn';

export const Input = ({ className, type, ...props }: React.ComponentProps<'input'>) => {
	return (
		<input
			type={type}
			data-slot="input"
			className={cn(
				'placeholder:text-muted-foreground border-border text-foreground h-10 w-full min-w-0 rounded-full border bg-transparent px-3 text-base text-sm shadow-xs outline-hidden transition-[color,box-shadow] disabled:opacity-50',
				'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
				'aria-invalid:ring-destructive/20 aria-invalid:border-destructive',
				'read-only:bg-muted/50 read-only:text-muted-foreground read-only:cursor-default read-only:focus-visible:ring-0',
				type === 'number' &&
					'[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
				className,
			)}
			{...props}
		/>
	);
};

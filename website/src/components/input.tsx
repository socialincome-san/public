import * as React from 'react';

import { cn } from '@socialincome/ui';

export const Input = ({ className, type, ...props }: React.ComponentProps<'input'>) => {
	return (
		<input
			type={type}
			data-slot="input"
			className={cn(
				'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input text-foreground flex h-9 w-full min-w-0 rounded-full border bg-transparent px-3 py-1 text-base shadow-xs outline-hidden transition-[color,box-shadow] file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
				'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
				'read-only:bg-muted/50 read-only:text-muted-foreground read-only:cursor-default read-only:focus-visible:ring-0',
				'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
				type === 'number' &&
					'[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
				className,
			)}
			{...props}
		/>
	);
};

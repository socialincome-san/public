import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { type WithoutClassName } from '../../without-class-name';

const inputVariants = cva(
	'placeholder:text-muted-foreground text-primary w-full min-w-0 outline-hidden transition-[color,box-shadow] disabled:opacity-50 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [&[type=number]]:[appearance:textfield]',
	{
		variants: {
			variant: {
				default: [
					'border-border bg-background h-10 rounded-full border px-3 text-sm shadow-xs',
					'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
					'read-only:bg-muted/50 read-only:text-muted-foreground read-only:cursor-default read-only:focus-visible:ring-0',
					'aria-invalid:ring-destructive/20 aria-invalid:border-destructive',
				].join(' '),
				// No box of its own: sits inside a custom field container and takes over its typography
				bare: 'bg-transparent p-0 [font:inherit] [text-align:inherit]',
			},
		},
		defaultVariants: {
			variant: 'default',
		},
	},
);

const Input = ({
	variant,
	...props
}: WithoutClassName<React.ComponentProps<'input'>> & VariantProps<typeof inputVariants>) => {
	return <input data-slot="input" className={inputVariants({ variant })} {...props} />;
};

export { Input, inputVariants };

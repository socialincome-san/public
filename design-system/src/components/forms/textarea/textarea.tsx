import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { type WithoutClassName } from '../../../without-class-name';

const textareaVariants = cva(
	'placeholder:text-muted-foreground text-primary w-full min-w-0 outline-hidden transition-[color,box-shadow] disabled:opacity-50 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer] :appearance-none [appearance:textfield]',
	{
		variants: {
			variant: {
				default: [
					'border-border bg-background min-h-24 rounded-2xl border px-3 text-sm shadow-xs',
					'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
					'read-only:bg-muted/50 read-only:text-muted-foreground read-only:cursor-default read-only:focus-visible:ring-0',
					'aria-invalid:ring-destructive/20 aria-invalid:border-destructive',
				].join(' '),
				bare: 'bg-transparent p-0 [font:inherit] [text-align:inherit]',
			},
		},
		defaultVariants: {
			variant: 'default',
		},
	},
);

const Textarea = ({
	variant,
	...props
}: WithoutClassName<React.ComponentProps<'textarea'>> & VariantProps<typeof textareaVariants>) => {
	return <textarea data-slot="textarea" className={textareaVariants({ variant })} {...props} />;
};

export { Textarea, textareaVariants };

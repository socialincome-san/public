'use client';

import * as LabelPrimitive from '@radix-ui/react-label';
import { cva } from 'class-variance-authority';
import * as React from 'react';
import { type WithoutClassName } from '../../without-class-name';

// Inline-flex so a label can wrap its control (e.g. a radio item and its text)
const labelVariants = cva(
	'text-foreground inline-flex cursor-pointer items-center gap-2 text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
	{
		variants: {
			invalid: {
				true: 'text-destructive',
			},
		},
	},
);

const Label = React.forwardRef<
	React.ElementRef<typeof LabelPrimitive.Root>,
	WithoutClassName<React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>> & { invalid?: boolean }
>(({ invalid, ...props }, ref) => <LabelPrimitive.Root ref={ref} className={labelVariants({ invalid })} {...props} />);
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };

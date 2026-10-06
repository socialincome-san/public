'use client';

import * as PopoverPrimitive from '@radix-ui/react-popover';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { type WithoutClassName } from '../../without-class-name';

const popoverContentVariants = cva(
	// z-[110] keeps popovers above the mobile navigation overlay (z-100)
	'bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-[110] origin-(--radix-popover-content-transform-origin) rounded-md border shadow-md outline-hidden',
	{
		variants: {
			variant: {
				default: 'w-72 p-4',
				// Flush content such as option lists or calendars, at least as wide as the trigger
				picker: 'pointer-events-auto w-auto min-w-(--radix-popover-trigger-width) overflow-hidden p-0',
			},
		},
		defaultVariants: {
			variant: 'default',
		},
	},
);

const Popover = ({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Root>) => {
	return <PopoverPrimitive.Root data-slot="popover" {...props} />;
};

const PopoverTrigger = ({ ...props }: WithoutClassName<React.ComponentProps<typeof PopoverPrimitive.Trigger>>) => {
	return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
};

const PopoverContent = ({
	variant,
	align = 'center',
	sideOffset = 4,
	...props
}: WithoutClassName<React.ComponentProps<typeof PopoverPrimitive.Content>> &
	VariantProps<typeof popoverContentVariants>) => {
	return (
		<PopoverPrimitive.Portal>
			<PopoverPrimitive.Content
				data-slot="popover-content"
				align={align}
				sideOffset={sideOffset}
				className={popoverContentVariants({ variant })}
				{...props}
			/>
		</PopoverPrimitive.Portal>
	);
};

export { Popover, PopoverContent, PopoverTrigger };

'use client';

import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { type WithoutClassName } from '../../../without-class-name';

// Triggers always get equal widths, sized either by the widest label or by the container
const tabsListVariants = cva(
	'bg-muted text-muted-foreground h-10 auto-cols-fr grid-flow-col items-center rounded-full p-[3px]',
	{
		variants: {
			fullWidth: {
				true: 'grid w-full',
				false: 'inline-grid w-fit',
			},
		},
		defaultVariants: {
			fullWidth: false,
		},
	},
);

const Tabs = (props: WithoutClassName<React.ComponentProps<typeof TabsPrimitive.Root>>) => {
	return <TabsPrimitive.Root data-slot="tabs" className="flex flex-col gap-2" {...props} />;
};

const TabsList = ({
	fullWidth,
	...props
}: WithoutClassName<React.ComponentProps<typeof TabsPrimitive.List>> & VariantProps<typeof tabsListVariants>) => {
	return <TabsPrimitive.List data-slot="tabs-list" className={tabsListVariants({ fullWidth })} {...props} />;
};

const TabsTrigger = (props: WithoutClassName<React.ComponentProps<typeof TabsPrimitive.Trigger>>) => {
	return (
		<TabsPrimitive.Trigger
			data-slot="tabs-trigger"
			className="data-[state=active]:bg-background focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring text-foreground inline-flex h-full flex-1 items-center justify-center gap-1.5 rounded-full border border-transparent px-3 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-xs [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
			{...props}
		/>
	);
};
export { Tabs, TabsList, TabsTrigger };

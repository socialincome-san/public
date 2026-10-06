'use client';

import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { cva, type VariantProps } from 'class-variance-authority';
import { ChevronDownIcon } from 'lucide-react';
import * as React from 'react';
import { cn } from '../../../cn';
import { type WithoutClassName } from '../../../without-class-name';

const Accordion = (props: WithoutClassName<React.ComponentProps<typeof AccordionPrimitive.Root>>) => {
	return <AccordionPrimitive.Root data-slot="accordion" {...props} />;
};

const accordionItemVariants = cva('', {
	variants: {
		variant: {
			default: 'border-b last:border-b-0',
			// A self-contained box, e.g. a group of fields inside a form
			boxed: 'border-border bg-muted rounded-xl border px-2',
		},
	},
	defaultVariants: {
		variant: 'default',
	},
});

const AccordionItem = ({
	variant,
	...props
}: WithoutClassName<React.ComponentProps<typeof AccordionPrimitive.Item>> & VariantProps<typeof accordionItemVariants>) => {
	return <AccordionPrimitive.Item data-slot="accordion-item" className={accordionItemVariants({ variant })} {...props} />;
};

const AccordionTrigger = ({
	children,
	...props
}: WithoutClassName<React.ComponentProps<typeof AccordionPrimitive.Trigger>>) => {
	return (
		<AccordionPrimitive.Header className="flex">
			<AccordionPrimitive.Trigger
				data-slot="accordion-trigger"
				className="focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium outline-hidden transition-all hover:underline focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180"
				{...props}
			>
				{children}
				<ChevronDownIcon className="text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200" />
			</AccordionPrimitive.Trigger>
		</AccordionPrimitive.Header>
	);
};

// With forceMount the content stays mounted while closed (e.g. to keep form fields registered), so it is hidden instead
const AccordionContent = ({
	children,
	forceMount,
	...props
}: WithoutClassName<React.ComponentProps<typeof AccordionPrimitive.Content>>) => {
	return (
		<AccordionPrimitive.Content
			data-slot="accordion-content"
			forceMount={forceMount}
			className={cn(
				'data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm',
				forceMount && 'data-[state=closed]:hidden',
			)}
			{...props}
		>
			<div className="pt-0 pb-4">{children}</div>
		</AccordionPrimitive.Content>
	);
};

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
